import { Layout as AntLayout, theme, Typography } from 'antd';
import { Header, Content, Footer } from 'antd/es/layout/layout';
import { NotificationDropdown } from '~/features/notification/dropdown';
import { EditProfileModal } from '~/features/user/edit';
import { UserDropdown } from './user-dropdown';

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { token } = theme.useToken();

  return (
    <AntLayout style={{ minHeight: '100dvh', background: token.colorBgBase }}>
      <AntLayout style={{ background: token.colorBgBase }}>
        {/* Header part */}
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgBase,
            borderBottom: `1px solid ${token.colorSplit}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Header Title */}
          <Typography.Title
            level={3}
            style={{
              margin: 0,
              cursor: 'pointer',
              transition: 'color 0.2s',
              color: token.colorText,
            }}
            onClick={() => {
              if (window.location.pathname !== '/family-trees') {
                window.open('/family-trees', '_self');
              }
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = token.colorPrimary)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = token.colorText)
            }
          >
            Family Tree
          </Typography.Title>

          {/* Header Notification and Profile Div */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <NotificationDropdown />
            <UserDropdown />
          </div>
        </Header>

        {/* Content part (Trees Grid) */}
        <Content style={{ margin: '24px 16px 0' }}>
          <div
            style={{
              padding: 12,
              minHeight: 360,
              borderRadius: token.borderRadiusLG,
              background: token.colorBgContainer,
            }}
          >
            {children}
          </div>
        </Content>

        {/* Footer part */}
        <Footer
          style={{
            textAlign: 'center',
            background: token.colorBgBase,
            padding: '10px',
          }}
        >
          © {new Date().getFullYear()} FamilyTree. All rights reserved.
        </Footer>

        {/* Edit Profile Modal */}
        <EditProfileModal />
      </AntLayout>
    </AntLayout>
  );
};
