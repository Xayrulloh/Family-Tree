import { Badge, Dropdown, List, Avatar, Typography, Spin, MenuProps } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useUnit } from 'effector-react';
import { useState } from 'react';
import {
  $displayNotifications,
  $unreadCount,
  $showViewAll,
  markedAllAsRead,
  fetchNotificationsFx
} from './model';

export const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const notifications = useUnit($displayNotifications);
  const unreadCount = useUnit($unreadCount);
  const showViewAll = useUnit($showViewAll);
  const loading = useUnit(fetchNotificationsFx.pending);

  const dropdownContent = (
    <div style={{ width: 300, backgroundColor: '#fff' }}>
      <div
        style={{
          padding: '8px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: '#fff',
        }}
      >
        <Typography.Text strong>Notifications</Typography.Text>
        <Typography.Link onClick={() => markedAllAsRead()}>
          Mark all as read
        </Typography.Link>
      </div>
      <div style={{ maxHeight: 250, overflowY: 'auto', backgroundColor: '#fff' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
            <Spin />
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item style={{ padding: '12px 16px' }}>
                <List.Item.Meta
                  avatar={<Avatar src={item.senderAvatar} alt={item.senderUserId} />}
                  title={
                    <Typography.Text style={{ 
                      fontSize: 14,
                      fontWeight: item.isUnread ? '500' : 'normal'
                    }}>
                      {item.content}
                    </Typography.Text>
                  }
                  description={
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {item.timeAgo}
                    </Typography.Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {showViewAll && (
        <div
          style={{
            borderTop: '1px solid #f0f0f0',
            padding: '8px 16px',
            textAlign: 'center',
            backgroundColor: '#fff',
          }}
        >
          <Typography.Link>View all notifications</Typography.Link>
        </div>
      )}
    </div>
  );

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: dropdownContent,
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      trigger={['click']}
      onOpenChange={(visible) => setOpen(visible)}
      open={open}
      placement="bottomRight"
      dropdownRender={(menu) => (
        <div style={{ boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)' }}>
          {menu}
        </div>
      )}
    >
      <Badge count={unreadCount}>
      <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />

      </Badge>
    </Dropdown>
  );
};