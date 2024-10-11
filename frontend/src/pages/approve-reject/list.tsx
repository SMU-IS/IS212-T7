import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Table,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Empty,
  Card,
} from "antd";
import { List, TagField } from "@refinedev/antd";
import CountUp from "react-countup";

// Mocked Data with Four Status Types and Department/Team
const mockPosts = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  name: `Post Title ${index + 1}`,
  email: `Email${index + 1}@example.com`,
  role: `Role ${index + 1}`,
  date: `3rd Oct 24`,
  department: index % 2 === 0 ? "Marketing" : "Engineering",
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

const formatter = (value: number) => <CountUp end={value} separator="," />;

export const IncomingList: React.FC = () => {
  const [dataSource, setDataSource] = useState(mockPosts);
  const [filteredData, setFilteredData] = useState(mockPosts);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(
    undefined,
  );
  const [description, setDescription] = useState<string>(""); // New state for description
  const [showDescription, setShowDescription] = useState<boolean>(false); // New state for description visibility

  const navigate = useNavigate();

  useEffect(() => {
    setDataSource(mockPosts);
    setFilteredData(mockPosts);
  }, []);

  useEffect(() => {
    if (filterStatus) {
      setFilteredData(
        dataSource.filter((post) => post.status === filterStatus),
      );
    } else {
      setFilteredData(dataSource);
    }
  }, [filterStatus, dataSource]);

  // Function to calculate the count of requests based on status
  const getStatusCounts = () => {
    return {
      pending: dataSource.filter((post) => post.status === "Pending").length,
      approved: dataSource.filter((post) => post.status === "Approved").length,
      expired: dataSource.filter((post) => post.status === "Expired").length,
      rejected: dataSource.filter((post) => post.status === "Rejected").length,
    };
  };

  const counts = getStatusCounts(); // Get the current counts for each status

  const handleEditClick = (post: any) => {
    setCurrentPost(post);
    setDescription("");
    setShowDescription(false);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setCurrentPost(null);
    setDescription("");
  };

  const handleSave = (values: any) => {
    console.log("Updated values:", values);
    const updatedPost = {
      ...currentPost,
      ...values,
      description: description || undefined,
    };
    const updatedDataSource = dataSource.map((post) =>
      post.id === currentPost?.id ? updatedPost : post,
    );
    setDataSource(updatedDataSource);
    setFilteredData(
      updatedDataSource.filter(
        (post) => !filterStatus || post.status === filterStatus,
      ),
    );
    setModalVisible(false);
    setCurrentPost(null);
    setDescription("");
    setShowDescription(false);
  };

  return (
    <List>
      <Typography.Title level={3}>Approve/Reject WFH Requests</Typography.Title>

      {/* Row for Animated Status Counts */}
      <Row gutter={16}>
        <Col span={6}>
          <Card bordered={true} style={{ borderColor: "lightblue" }}>
            <Statistic
              title="Pending"
              value={counts.pending}
              formatter={formatter}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Approved"
              value={counts.approved}
              formatter={formatter}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Expired"
              value={counts.expired}
              formatter={formatter}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Rejected"
              value={counts.rejected}
              formatter={formatter}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter by status */}
      <Select
        placeholder="Filter by status"
        style={{ width: 200, marginBottom: 16, float: "right", marginTop: 50 }}
        onChange={(value) => setFilterStatus(value)}
        defaultValue={"All"}
        allowClear
      >
        <Select.Option value={undefined}>All</Select.Option>
        <Select.Option value="Pending">Pending</Select.Option>
        <Select.Option value="Approved">Approved</Select.Option>
        <Select.Option value="Expired">Expired</Select.Option>
        <Select.Option value="Rejected">Rejected</Select.Option>
      </Select>

      {/* Table */}
      <Table dataSource={filteredData} rowKey="id" pagination={false}>
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column dataIndex="role" title="Role" />
        <Table.Column dataIndex="date" title="WFH Date" />
        <Table.Column dataIndex="department" title="Department/Team" />
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
                      : "orange"
              }
            />
          )}
        />
        <Table.Column
          dataIndex="action"
          title="Action"
          render={(value: string, record: any) =>
            record.status === "Pending" ? (
              <Button onClick={() => handleEditClick(record)}>Edit</Button>
            ) : (
              <TagField value="Not-editable" color="grey" />
            )
          }
        />
      </Table>

      {/* Modal for Editing */}
      <Modal
        title="Approve/Reject"
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        key={currentPost ? currentPost.id : "modal"}
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
                onChange={(value) => setShowDescription(value === "Rejected")}
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
