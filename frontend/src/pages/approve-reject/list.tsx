import { useMany } from "@refinedev/core";
import { List, TextField, TagField, useTable } from "@refinedev/antd";
import { Table } from "antd";
import { useEffect, useState } from "react";

// Mocked Data with Three Status Types
const mockPosts = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  title: `Post Title ${index + 1}`,
  category: {
    id: (index % 3) + 1, // Example category IDs
  },
  status:
    index % 3 === 0 ? "Pending" : index % 3 === 1 ? "Approved" : "Expired", // Three statuses
}));

export const IncomingList: React.FC = () => {
  // Mocking tableProps dataSource with 10 rows of posts
  const [dataSource, setDataSource] = useState<IPost[]>([]);

  useEffect(() => {
    setDataSource(mockPosts); // Setting mocked data for 10 rows
  }, []);

  const categoryIds = dataSource?.map((item) => item.category.id) ?? [];
  const { data, isLoading } = useMany<ICategory>({
    resource: "categories",
    ids: categoryIds,
    queryOptions: {
      enabled: categoryIds.length > 0,
    },
  });

  return (
    <List>
      <Table dataSource={dataSource} rowKey="id" pagination={false}>
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="title" title="Title" />
        <Table.Column
          dataIndex={["category", "id"]}
          title="Category"
          render={(value) => {
            if (isLoading) {
              return <TextField value="Loading..." />;
            }

            return (
              <TextField
                value={
                  data?.data.find((item) => item.id === value)?.title ||
                  "No Category"
                }
              />
            );
          }}
        />
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
                    : "red"
              }
            />
          )}
        />
      </Table>
    </List>
  );
};
