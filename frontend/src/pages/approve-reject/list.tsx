import { useMany } from "@refinedev/core";
import { List, TextField, TagField, useTable } from "@refinedev/antd";
import { Button, Table, Typography, Modal, Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Mocked Data with Four Status Types and Department/Team
const mockPosts = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  name: `Post Title ${index + 1}`,
  email: `Email${index + 1}@example.com`,
  role: `Role ${index + 1}`,
  date: `3rd Oct 24`,
  department: index % 2 === 0 ? "Marketing" : "Engineering", // Example department field
  category: {
    id: (index % 3) + 1, // Example category IDs
  },
  status:
    index % 4 === 0
      ? "Pending"
      : index % 4 === 1
        ? "Approved"
        : index % 4 === 2
          ? "Expired"
          : "Rejected", // Four statuses including Rejected
  action: index % 2 === 0 ? "Yes" : "Not-editable",
}));

export const IncomingList: React.FC = () => {
  const [dataSource, setDataSource] = useState<IPost[]>([]);
  const [filteredData, setFilteredData] = useState<IPost[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPost, setCurrentPost] = useState<IPost | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(
    undefined,
  );
  const [showDescription, setShowDescription] = useState<boolean>(false); // New state for description visibility
  const [description, setDescription] = useState<string>(""); // New state for description
  const navigate = useNavigate();

  useEffect(() => {
    setDataSource(mockPosts);
    setFilteredData(mockPosts); // Initialize filtered data
  }, []);

  useEffect(() => {
    // Filter data based on selected status
    if (filterStatus) {
      setFilteredData(
        dataSource.filter((post) => post.status === filterStatus),
      );
    } else {
      setFilteredData(dataSource);
    }
  }, [filterStatus, dataSource]);

  const handleEditClick = (post: IPost) => {
    setCurrentPost(post);
    setDescription(""); // Reset description on edit
    setShowDescription(false); // Reset description visibility on edit
    setModalVisible(true);
    console.log(post);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setCurrentPost(null); // Clear current post on modal close
    setDescription(""); // Clear description on close
  };

  const handleSave = async (values: any) => {
    if (currentPost?.status === "Rejected" && !description) {
      // Check for description if status is Rejected
      alert("Please provide a description for the rejected status.");
      return;
    }

    console.log("Updated values:", values);
    // Save the updated values logic here
    const updatedPost = {
      ...currentPost,
      ...values,
      description: description || undefined,
    };
    const updatedDataSource = dataSource.map((post) =>
      post.id === currentPost?.id ? updatedPost : post,
    );
    setDataSource(updatedDataSource); // Update the data source with new values
    // Update filtered data based on current filter
    setFilteredData(
      updatedDataSource.filter(
        (post) => !filterStatus || post.status === filterStatus,
      ),
    );
    setModalVisible(false);
    setCurrentPost(null); // Clear current post after saving
    setDescription(""); // Clear description after saving
    setShowDescription(false); // Reset description visibility after saving
  };

  return (
    <List>
      <Typography.Title level={3}>Approve/Reject WFH Requests</Typography.Title>
      <Select
        placeholder="Filter by status"
        style={{ width: 200, marginBottom: 16 }}
        onChange={(value) => setFilterStatus(value)}
        allowClear
      >
        <Select.Option value={undefined}>All</Select.Option> {/* All option */}
        <Select.Option value="Pending">Pending</Select.Option>
        <Select.Option value="Approved">Approved</Select.Option>
        <Select.Option value="Expired">Expired</Select.Option>
        <Select.Option value="Rejected">Rejected</Select.Option>
      </Select>
      <Table dataSource={filteredData} rowKey="id" pagination={false}>
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column dataIndex="role" title="Role" />
        <Table.Column dataIndex="date" title="WFH Date" />
        <Table.Column dataIndex="department" title="Department/Team" />{" "}
        {/* New column */}
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(value: string) => (
            <TagField
              value={value}
              color={
                value === "Pending"
                  ? "blue"
                  : value === "Approved"
                    ? "green"
                    : value === "Expired"
                      ? "red"
                      : "orange" // Color for Rejected
              }
            />
          )}
        />
        <Table.Column
          dataIndex="action"
          title="Action"
          render={(value: string, record: IPost) => {
            return record.status === "Pending" ? (
              <Button onClick={() => handleEditClick(record)}>Edit</Button>
            ) : (
              <TagField value="Not-editable" color="lightgrey" />
            );
          }}
        />
      </Table>

      {/* Modal for Editing */}
      <Modal
        title="Approve/Reject"
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        key={currentPost ? currentPost.id : "modal"} // Add a unique key
      >
        {currentPost && (
          <Form
            initialValues={{
              title: currentPost.name,
              email: currentPost.email,
              status: currentPost.status,
            }}
            onFinish={handleSave}
          >
            <Form.Item label="Title" name="title">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Status is required" }]}
            >
              <Select
                onChange={(value) => {
                  setShowDescription(value === "Rejected"); // Show description if status is "Rejected"
                }}
              >
                <Select.Option value="Pending">Pending</Select.Option>
                <Select.Option value="Approved">Approved</Select.Option>
                <Select.Option value="Rejected">Rejected</Select.Option>
              </Select>
            </Form.Item>
            {showDescription && (
              <Form.Item
                label="Description"
                name="description"
                rules={[
                  {
                    required: showDescription,
                    message: "Description is required for rejected status.",
                  },
                ]}
              >
                <Input.TextArea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Item>
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </List>
  );
};

interface IPost {
  id: number;
  name: string;
  email: string;
  role: string;
  date: string;
  status: string;
  action: string;
  department: string; // Add department field to the interface
  category: {
    id: number;
  };
  description?: string; // Optional description field
}
