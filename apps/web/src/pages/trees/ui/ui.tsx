import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import type { FamilyTreeSchemaType } from '@family-tree/shared';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Flex,
  type MenuProps,
  Row,
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
import { PageLoading } from '~/shared/ui/loading';
import { factory } from '../model';

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
      onClick: (event) => {
        event.domEvent.stopPropagation();
        createEditTreeModel.editTrigger({
          id: tree.id,
          values: {
            image: tree.image,
            name: tree.name,
          },
        });
      },
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: (event) => {
        event.domEvent.stopPropagation();
        deleteTreeModel.deleteTrigger({ id: tree.id });
      },
    },
  ];

  return (
    <Link to={routes.treesDetail} params={{ id: tree.id }}>
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
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
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
              <img
                src={tree.image}
                loading="eager"
                alt={tree.name}
                style={{
                  height: '100%',
                  width: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  transition: 'transform 0.3s',
                }}
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
              e.preventDefault();
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
      </Card>
    </Link>
  );
};

// Shared Tree Card Component
export const SharedTreeCard: React.FC<TreeCardProps> = ({ tree }) => {
  const { token } = theme.useToken();

  return (
    <Link to={routes.sharedTreesDetail} params={{ id: tree.id }}>
      {''}
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
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
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
              <img
                src={tree.image}
                loading="eager"
                alt={tree.name}
                style={{
                  height: '100%',
                  width: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  transition: 'transform 0.3s',
                }}
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
      </Card>
    </Link>
  );
};

// Trees Grid Component => Already Created Trees Component
const TreesGrid: React.FC<Props> = ({ model }) => {
  const [trees, sharedTrees] = useUnit([model.$trees, model.$sharedTrees]);

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ marginBottom: 40 }}>
        <Typography.Title level={3}>My Family Trees</Typography.Title>

        <Row gutter={[16, 16]}>
          {/* Own Trees */}
          {trees.map((tree) => (
            <Col xs={12} sm={8} md={6} lg={6} xl={4} key={tree.id}>
              <TreeCard tree={tree} />
            </Col>
          ))}

          {/* Create A New Tree */}
          <Col xs={12} sm={8} md={6} lg={6} xl={4}>
            <Card
              hoverable
              onClick={() => createEditTreeModel.createTrigger()}
              style={{
                height: '100%',
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
        </Row>
      </div>

      {sharedTrees.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <Typography.Title level={3}>Shared With Me</Typography.Title>
          <Row gutter={[16, 16]}>
            {/* Shared Trees */}
            {sharedTrees.map((tree) => (
              <Col xs={12} sm={8} md={6} lg={6} xl={4} key={tree.id}>
                <SharedTreeCard tree={tree} />
              </Col>
            ))}
          </Row>
        </div>
      )}
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
