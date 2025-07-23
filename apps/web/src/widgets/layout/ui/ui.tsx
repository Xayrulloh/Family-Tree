import { Layout as AntLayout, theme, Typography } from 'antd';
import { Header, Content, Footer } from 'antd/es/layout/layout';
import { NotificationDropdown } from '~/features/notification/dropdown';
import { EditProfileModal } from '~/features/user/edit';
import { UserDropdown } from './user-dropdown';

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { token } = theme.useToken();
  return (
    <AntLayout style={{ minHeight: '100dvh' }}>
      <AntLayout style={{ background: token.colorWhite }}>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorWhite,
            borderBottom: '2px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography.Title
            level={3}
            style={{
              margin: 0,
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onClick={() => {
              if (window.location.pathname !== '/family-trees') {
                window.open('/family-trees', '_self');
              }
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#1890ff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '')}
          >
            Family Tree
          </Typography.Title>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <NotificationDropdown />
            <UserDropdown />
          </div>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div
            style={{
              padding: 12,
              minHeight: 360,
              borderRadius: token.borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center', background: token.colorWhite }}>
          © {new Date().getFullYear()} FamilyTree. All rights reserved.
        </Footer>

        {/* Edit Profile Modal */}
        <EditProfileModal />
      </AntLayout>
    </AntLayout>
  );
};
