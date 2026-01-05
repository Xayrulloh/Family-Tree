import { Layout as AntLayout, Typography, theme } from 'antd';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import { EditProfileModal } from '~/features/user/edit';
import { UserDropdown } from './user-dropdown';

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { token } = theme.useToken();

  return (
    <AntLayout style={{ height: '100dvh', background: token.colorBgBase }}>
      <AntLayout
        style={{
          background: token.colorBgBase,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {/* Header part */}
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgBase,
            borderBottom: `1px solid ${token.colorSplit}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          {/* Header Title */}
          <Typography.Title
            level={3}
            className="!m-0 cursor-pointer transition-colors duration-200"
            style={{ color: token.colorText }}
            onClick={() => {
              if (window.location.pathname !== '/family-trees') {
                window.open('/family-trees', '_self');
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = token.colorPrimary;

              return e.currentTarget.style.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = token.colorText;

              return e.currentTarget.style.color;
            }}
          >
            Family Tree
          </Typography.Title>

          {/* Header Notification and Profile Div */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* TODO: here should be notification */}
            <UserDropdown />
          </div>
        </Header>

        {/* Main content */}
        <Content
          className="px-4 sm:px-6 md:px-8 py-4"
          style={{
            flex: 1,
            overflow: 'auto',
          }}
        >
          <div
            className="min-h-[360px] rounded-lg"
            style={{
              background: token.colorBgContainer,
            }}
          >
            {children}
          </div>
        </Content>

        {/* Footer part */}
        <Footer
          className="text-center py-4"
          style={{
            background: token.colorBgBase,
            flexShrink: 0,
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
