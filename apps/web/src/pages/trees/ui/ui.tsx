import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  GlobalOutlined,
  LockOutlined,
} from '@ant-design/icons';
import type { FamilyTreeSchemaType } from '@family-tree/shared';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Flex,
  Image,
  type MenuProps,
  Row,
  Space,
  Typography,
  theme,
} from 'antd';
import { Link } from 'atomic-router-react';
import { useUnit } from 'effector-react';
import {
  CreateEditTreeModal,
  createEditTreeModel,
} from '~/features/tree/create-edit';
import { DeleteTreeModal, deleteTreeModel } from '~/features/tree/delete';
import { routes } from '~/shared/config/routing';
import type { LazyPageProps } from '~/shared/lib/lazy-page';
import { factory } from '../model';
import { PageLoading } from '~/shared/ui/loading';

// Types
type Model = ReturnType<typeof factory>;
type Props = LazyPageProps<Model>;
type TreeCardProps = {
  tree: FamilyTreeSchemaType;
};

// Tree Card Component for Already Created Tree
export const TreeCard: React.FC<TreeCardProps> = ({ tree }) => {
  const { token } = theme.useToken();

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
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
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => {
        deleteTreeModel.deleteTriggered({ id: tree.id });
      },
    },
  ];

  return (
    <Link to={routes.treesDetail} params={{ familyTreeId: tree.id }}>
      {''}
      {/* ← Wrap with Link */}
      <Card
        hoverable
        styles={{
          body: {
            padding: '12px 16px 16px',
            height: 'calc(100% - 140px)',
          },
        }}
        style={{
          height: '100%',
          minHeight: 220,
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer', // Already have hoverable, but explicit
        }}
        cover={
          <div
            style={{
              height: 140,
              background: token.colorFillContent,
              display: 'flex',
              overflow: 'hidden',
              position: 'relative',
              ...(tree.image
                ? {}
                : {
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: token.colorFillSecondary,
                  }),
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
                  objectPosition: 'center',
                  transition: 'transform 0.3s',
                }}
                preview={false}
              />
            ) : (
              <span
                role="img"
                aria-label="tree"
                style={{
                  fontSize: 48,
                  lineHeight: 1,
                  color: token.colorTextDescription,
                }}
              >
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
            onClick={(e) => {
              e.preventDefault(); // ← Prevent navigation when clicking dropdown
              e.stopPropagation();
            }}
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
            marginTop: 0,
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
    </Link>
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
          <Col xs={12} sm={8} md={6} lg={6} xl={4} key={tree.id}>
            <TreeCard tree={tree} />
          </Col>
        ))}

        {/* Create A New Tree */}
        {
          <Col xs={12} sm={8} md={6} lg={6} xl={4}>
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
                Create A New Tree
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
    return <PageLoading />;
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
