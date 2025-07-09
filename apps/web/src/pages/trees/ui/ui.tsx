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
} from 'antd';
import { factory } from '../model';
import { LazyPageProps } from '../../../shared/lib/lazy-page';
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
} from '../../../features/tree/create-edit';

type Model = ReturnType<typeof factory>;
type Props = LazyPageProps<Model>;
type TreeCardProps = {
  tree: FamilyTreeSchemaType;
  onEdit?: (tree: FamilyTreeSchemaType) => void;
  onDelete?: (tree: FamilyTreeSchemaType) => void;
};

export const TreeCard: React.FC<TreeCardProps> = ({
  tree,
  onEdit,
  onDelete,
}) => {
  const handleEdit = () => onEdit?.(tree);
  const handleDelete = () => onDelete?.(tree);

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: 'Edit',
      onClick: handleEdit,
    },
    {
      key: 'delete',
      label: 'Delete',
      danger: true,
      onClick: handleDelete,
    },
  ];

  return (
    <Card
      hoverable
      style={{ height: '100%', position: 'relative' }}
      onClick={() => window.open('https://google.com', '_blank')}
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
            <img
              src={tree.image}
              alt={tree.name}
              style={{ maxHeight: '100%', objectFit: 'contain' }}
            />
          ) : (
            <span role="img" aria-label="tree" style={{ fontSize: 40 }}>
              🌲
            </span>
          )}
        </div>
      }
    >
      {/* 3 dots menu (absolute positioned top-right) */}
      <Dropdown
        menu={{ items: menuItems }}
        trigger={['click']}
        placement="bottomRight"
      >
        <EllipsisOutlined
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: 8,
            right: 20,
            fontSize: 25,
            cursor: 'pointer',
          }}
        />
      </Dropdown>

      {/* Card content */}
      <Typography.Text strong>{tree.name}</Typography.Text>
      <div style={{ marginTop: 8 }}>
        {tree.public ? <GlobalOutlined /> : <LockOutlined />}
        <Typography.Text style={{ marginLeft: 8 }}>
          {tree.public ? 'Public' : 'Private'}
        </Typography.Text>
      </div>
    </Card>
  );
};

const TreesGrid: React.FC<Props> = ({ model }) => {
  const [trees] = useUnit([model.$trees, model.$fetching]);

  return (
    <div style={{ marginBottom: 40 }}>
      <Typography.Title level={4}>="My Family Trees"</Typography.Title>
      <Row gutter={[16, 16]}>
        {trees.map((tree) => (
          <Col key={tree.id} xs={24} sm={12} md={8} lg={6}>
            <TreeCard tree={tree} />
          </Col>
        ))}

        {
          <Col xs={24} sm={12} md={8} lg={6}>
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
              <span role="img" aria-label="tree" style={{ fontSize: 40 }}>
                🌲
              </span>
              <br />
              <Typography.Text>Create New Tree</Typography.Text>
            </Card>
          </Col>
        }
      </Row>
    </div>
  );
};

const TreesPage: React.FC<Props> = ({ model }) => {
  const [treesFetching] = useUnit([model.$fetching]);
  const { token } = theme.useToken();

  if (treesFetching) {
    return (
      <Flex justify="center" align="center" style={{ height: '100vh' }}>
        <Spin size="large" tip="Loading your family trees...">
          <div style={{ padding: 24 }} />
        </Spin>
      </Flex>
    );
  }

  return (
    <Flex vertical gap={token.size}>
      <TreesGrid model={model} />
      <CreateEditTreeModal />
    </Flex>
  );
};

export const component = TreesPage;
export const createModel = factory;
