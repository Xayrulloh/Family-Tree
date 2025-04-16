import { Flex, theme, Row, Col, Typography, Card } from 'antd';
import { factory } from '../model';
import { LazyPageProps } from '../../../shared/lib/lazy-page';
import { useUnit } from 'effector-react';
import { FamilyTreeResponseType } from '@family-tree/shared';
import { CreateTree } from '../../../features/tree/create';
import { LockOutlined, GlobalOutlined } from '@ant-design/icons';

type Model = ReturnType<typeof factory>;
type Props = LazyPageProps<Model>;

const TreeCard: React.FC<{
  tree: FamilyTreeResponseType;
}> = ({ tree }) => {
  return (
    <Card
      hoverable
      style={{ height: '100%' }}
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
            <span>🌲</span>
          )}
        </div>
      }
    >
      <Typography.Text strong>{tree.name}</Typography.Text>
      <div>
        {tree.public ? <GlobalOutlined /> : <LockOutlined />}
        <Typography.Text style={{ marginLeft: 8 }}>
          {tree.public ? 'Public' : 'Private'}
        </Typography.Text>
      </div>
    </Card>
  );
};

const TreesGrid: React.FC<{
  trees: FamilyTreeResponseType[];
  title: string;
  showCreate?: boolean;
}> = ({ trees, title, showCreate }) => {
  return (
    <div style={{ marginBottom: 40 }}>
      <Typography.Title level={4}>{title}</Typography.Title>
      <Row gutter={[16, 16]}>
        {trees.map((tree) => (
          <Col key={tree.id} xs={24} sm={12} md={8} lg={6}>
            <TreeCard tree={tree} />
          </Col>
        ))}

        {showCreate && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
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
              <div style={{ fontSize: 32 }}>🌲</div>
              <Typography.Text>Create New Tree</Typography.Text>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

const TreesPage: React.FC<Props> = ({ model }) => {
  const [trees, treesFetching] = useUnit([model.$trees, model.$treesFetching]);
  const { token } = theme.useToken();

  return (
    <Flex vertical gap={token.size}>
      {/* <Flex justify="end">
        <CreateTree />
      </Flex> */}
      <TreesGrid title="My Family Trees" trees={trees} showCreate/>
    </Flex>
  );
};

export const component = TreesPage;
export const createModel = factory;
