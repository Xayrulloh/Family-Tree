// biome-ignore assist/source/organizeImports: <false>
import React from 'react';
import { Link } from 'atomic-router-react';
import { Button, Typography, Card, Row, Col } from 'antd';
import {
  TeamOutlined,
  UserAddOutlined,
  LinkOutlined,
  CrownOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { routes } from '~/shared/config/routing';
import { factory } from '../model';

const { Title, Paragraph } = Typography;

const features = [
  {
    icon: <TeamOutlined />,
    title: 'Instant Tree Builder',
    content:
      'Create beautiful family trees in minutes with our drag-and-drop interface',
  },
  {
    icon: <UserAddOutlined />,
    title: 'Real Family Collaboration',
    content: 'Invite living relatives to contribute and verify information',
  },
  {
    icon: <LinkOutlined />,
    title: 'Smart Family Merging',
    content: 'Automatically connect branches when marriages are recorded',
  },
  {
    icon: <HistoryOutlined />,
    title: 'Historical Dynasties',
    content: 'Explore pre-built trees of famous families throughout history',
  },
];

const HomePage: React.FC = () => {
  const colors = {
    primary: '#1677ff',
    primaryHover: '#0958d9',
    primaryActive: '#003eb3',
    text: '#333333',
    textSecondary: '#666666',
    background: '#ffffff',
    backgroundSecondary: '#f5f5f5',
    border: '#e0e0e0',
    borderSecondary: '#f0f0f0',
    white: '#ffffff',
    gold: '#ffd666',
  };

  return (
    <div
      className="landing-page"
      style={{ backgroundColor: colors.background }}
    >
      {/* Hero Banner */}
      <div
        style={{
          background: `linear-gradient(135deg, #1677ff 0%, #0958d9 100%)`,
          padding: 'clamp(60px, 8vw, 100px) 24px',
          textAlign: 'center',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Animated Background Elements */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-10%',
            width: '120%',
            height: '200%',
            background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)`,
            animation: 'pulse 15s infinite alternate',
            zIndex: 1,
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            right: '-10%',
            width: '80%',
            height: '160%',
            background: `radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)`,
            animation: 'pulse 18s infinite alternate-reverse',
            zIndex: 1,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1200px',
            width: '100%',
            padding: '0 16px',
          }}
        >
          <Title
            style={{
              color: '#ffffff',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              marginBottom: '24px',
              fontWeight: 700,
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              animation: 'fadeInUp 0.8s ease-out',
            }}
          >
            Connect Your Family Legacy
          </Title>

          <Paragraph
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              maxWidth: '800px',
              margin: '0 auto 40px',
              color: 'rgba(255, 255, 255, 0.9)',
              animation: 'fadeInUp 0.8s ease-out 0.2s forwards',
              opacity: 0,
            }}
          >
            The modern way to preserve and share your family history across
            generations
          </Paragraph>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              animation: 'fadeInUp 0.8s ease-out 0.4s forwards',
              opacity: 0,
            }}
          >
            <Link to={routes.trees}>
              <Button
                type="primary"
                size="large"
                shape="round"
                className="hero-primary-btn"
                style={{
                  padding: '0 32px',
                  height: '48px',
                  fontWeight: 500,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                  backgroundColor: '#ffffff',
                  color: '#1677ff',
                  border: 'none',
                  margin: '8px',
                }}
              >
                Start Your Tree
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div
        style={{
          padding: 'clamp(60px, 8vw, 100px) 24px',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <Title
          level={2}
          style={{
            textAlign: 'center',
            marginBottom: 'clamp(40px, 6vw, 80px)',
            color: colors.primary,
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 700,
            animation: 'fadeInUp 0.8s ease-out',
          }}
        >
          Powerful Family Tree Features
        </Title>

        <Row gutter={[24, 48]}>
          {features.map((feature, index) => (
            <Col
              xs={24}
              sm={12}
              lg={6}
              // biome-ignore lint/suspicious/noArrayIndexKey: <false>
              key={index}
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1 + 0.2}s forwards`,
                opacity: 0,
              }}
            >
              <Card
                hoverable
                className="feature-card"
                style={{
                  textAlign: 'center',
                  height: '100%',
                  borderRadius: '16px',
                  backgroundColor: colors.backgroundSecondary,
                  border: `1px solid ${colors.border}`,
                }}
                styles={{
                  body: {
                    padding: '32px 24px',
                  },
                }}
              >
                <div
                  style={{
                    marginBottom: '24px',
                    color: colors.primary,
                  }}
                >
                  {React.cloneElement(feature.icon, {
                    style: {
                      fontSize: '48px',
                      filter: `drop-shadow(0 4px 8px ${colors.primary}33)`,
                    },
                  })}
                </div>

                <Title
                  level={4}
                  style={{
                    color: colors.text,
                    marginBottom: '16px',
                    fontWeight: 600,
                    fontSize: '1.25rem',
                  }}
                >
                  {feature.title}
                </Title>

                <Paragraph
                  style={{
                    color: colors.textSecondary,
                    fontSize: '1rem',
                    lineHeight: 1.6,
                  }}
                >
                  {feature.content}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Historical Trees Section */}
      <div
        style={{
          padding: 'clamp(60px, 8vw, 100px) 24px',
          textAlign: 'center',
          background: colors.backgroundSecondary,
          position: 'relative',
        }}
      >
        <Title
          level={2}
          style={{
            marginBottom: '24px',
            color: colors.primary,
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 700,
            animation: 'fadeInUp 0.8s ease-out',
          }}
        >
          Explore Famous Dynasties
        </Title>

        <Paragraph
          style={{
            maxWidth: '700px',
            margin: '0 auto clamp(40px, 6vw, 60px)',
            color: colors.textSecondary,
            fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
            lineHeight: 1.6,
            animation: 'fadeInUp 0.8s ease-out',
          }}
        >
          Study pre-built family trees of historical figures and royal families
          with professionally researched genealogies
        </Paragraph>

        <Row gutter={[24, 48]}>
          {[
            'Ottoman Empire',
            'Timurid Dynasty',
            'European Monarchies',
            'Imperial China',
          ].map((dynasty, index) => (
            <Col
              xs={24}
              sm={12}
              lg={6}
              // biome-ignore lint/suspicious/noArrayIndexKey: <false>
              key={index}
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.15 + 0.4}s forwards`,
                opacity: 0,
              }}
            >
              <Card
                hoverable
                className="dynasty-card"
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                }}
                cover={
                  <div
                    style={{
                      height: '160px',
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <CrownOutlined
                      style={{
                        fontSize: '64px',
                        color: colors.gold,
                        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
                        zIndex: 2,
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                        animation: 'pulse 8s infinite alternate',
                        zIndex: 1,
                      }}
                    />
                  </div>
                }
              >
                <Card.Meta
                  title={
                    <span
                      style={{
                        color: colors.text,
                        fontWeight: 600,
                        fontSize: '1.125rem',
                      }}
                    >
                      {dynasty}
                    </span>
                  }
                  description={
                    <span
                      style={{
                        color: colors.textSecondary,
                        fontSize: '0.875rem',
                      }}
                    >
                      Explore {dynasty.split(' ')[0]} genealogy
                    </span>
                  }
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                  }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div
        style={{
          padding: 'clamp(60px, 8vw, 100px) 24px',
          textAlign: 'center',
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
          color: colors.white,
        }}
      >
        <Title
          level={2}
          style={{
            color: colors.white,
            marginBottom: '16px',
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            animation: 'fadeInUp 0.8s ease-out',
          }}
        >
          Ready to Begin Your Family Journey?
        </Title>
        <Paragraph
          style={{
            fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
            marginBottom: '32px',
            color: 'rgba(255, 255, 255, 0.9)',
            animation: 'fadeInUp 0.8s ease-out',
          }}
        >
          Join thousands of families preserving their history
        </Paragraph>
        <Link to={routes.trees}>
          <Button
            type="primary"
            size="large"
            shape="round"
            className="cta-button"
            style={{
              padding: '0 40px',
              height: '50px',
              fontWeight: 500,
              backgroundColor: colors.white,
              color: colors.primary,
              animation: 'fadeInUp 0.8s ease-out',
            }}
          >
            Create Free Account
          </Button>
        </Link>
      </div>
    </div>
  );
};

export const component = HomePage;
export const createModel = factory;
