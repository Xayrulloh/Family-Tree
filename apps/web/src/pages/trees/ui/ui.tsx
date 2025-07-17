import {
  Flex,
  theme,
  Row,
  Col,
  Typography,
  Card,
  Spin,
  Dropdown,
  MenuProps,
  Button,
  Space,
  Image,
} from 'antd';
import { factory } from '../model';
import { LazyPageProps } from '~/shared/lib/lazy-page';
import { useUnit } from 'effector-react';
import { FamilyTreeSchemaType } from '@family-tree/shared';
import {
  LockOutlined,
  GlobalOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import {
  CreateEditTreeModal,
  createEditTreeModel,
} from '~/features/tree/create-edit';
import { DeleteTreeModal, deleteTreeModel } from '~/features/tree/delete';

// Types
type Model = ReturnType<typeof factory>;
type Props = LazyPageProps<Model>;
type TreeCardProps = {
  tree: FamilyTreeSchemaType;
};

// Tree Card Component for Already Created Tree
export const TreeCard: React.FC<TreeCardProps> = ({ tree }) => {
  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: 'Edit',
      onClick: () =>
        createEditTreeModel.editTriggered({
          id: tree.id,
          values: {
            image: tree.image,
            name: tree.name,
            public: tree.public,
          },
        }),
    },
    {
      key: 'delete',
      label: 'Delete',
      danger: true,
      onClick: () => {
        deleteTreeModel.deleteTriggered({ id: tree.id });
      },
    },
  ];

  return (
    <Card
      hoverable
      styles={{ body: { padding: 10 } }}
      style={{
        height: '100%',
        minHeight: 220,
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
      cover={
        <div
          style={{
            height: 140,
            background: '#eee',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {tree.image ? (
            <Image
              src={tree.image}
              alt={tree.name}
              style={{
                height: '100%',
                width: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s',
              }}
            />
          ) : (
            <span role="img" aria-label="tree" style={{ fontSize: 40 }}>
              🌲
            </span>
          )}
        </div>
      }
    >
      <Dropdown
        menu={{ items: menuItems }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button
          shape="circle"
          icon={<EllipsisOutlined />}
          size="small"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: 8,
            right: 20,
            zIndex: 1,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 25,
          }}
        />
      </Dropdown>

      <Typography.Title
        level={5}
        style={{
          marginBottom: 4,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={tree.name}
      >
        {tree.name}
      </Typography.Title>

      <Space size="small">
        {tree.public ? <GlobalOutlined /> : <LockOutlined />}
        <Typography.Text type="secondary">
          {tree.public ? 'Public' : 'Private'}
        </Typography.Text>
      </Space>
    </Card>
  );
};

// Trees Grid Component => Already Created Trees Component
const TreesGrid: React.FC<Props> = ({ model }) => {
  const [trees] = useUnit([model.$trees, model.$fetching]);

  return (
    <div style={{ marginBottom: 40, padding: '0 16px' }}>
      <Typography.Title level={3}>My Family Trees</Typography.Title>

      <Row gutter={[16, 16]}>
        {/* Exist Trees */}
        {trees.map((tree) => (
          <Col key={tree.id} xs={24} sm={12} md={8} lg={6} xl={4}>
            <TreeCard tree={tree} />
          </Col>
        ))}

        {/* Create New Tree */}
        {
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              onClick={() => createEditTreeModel.createTriggered()}
              style={{
                height: '100%',
                minHeight: 220,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px dashed #ccc',
              }}
            >
              <span
                role="img"
                aria-label="tree"
                style={{ fontSize: 40, position: 'relative', left: 22 }}
              >
                🌲
              </span>
              <br />
              <Typography.Text style={{ fontSize: 15 }}>
                Create New Tree
              </Typography.Text>
            </Card>
          </Col>
        }
      </Row>
    </div>
  );
};

// Main Component => Trees Grid Component
const TreesPage: React.FC<Props> = ({ model }) => {
  const [treesFetching] = useUnit([model.$fetching]);
  const { token } = theme.useToken();

  // Loader
  if (treesFetching) {
    return (
      <Flex justify="center" align="center" style={{ padding: '64px 0' }}>
        <Spin size="large">
          <div style={{ padding: 24 }} />
        </Spin>
      </Flex>
    );
  }

  return (
    <Flex vertical gap={token.size}>
      <TreesGrid model={model} />
      <CreateEditTreeModal />
      <DeleteTreeModal />
    </Flex>
  );
};

export const component = TreesPage;
export const createModel = factory;
