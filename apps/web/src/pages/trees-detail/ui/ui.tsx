import { useUnit } from 'effector-react';
import type React from 'react';
import type { LazyPageProps } from '~/shared/lib/lazy-page';
import { factory } from '../model';
import { PageLoading } from '~/shared/ui/loading';
import { Visualization } from './visualization';

// Types
type Model = ReturnType<typeof factory>;
export type Props = LazyPageProps<Model>;

export const FamilyTreeView: React.FC<Props> = ({ model }) => {
  const [loading] = useUnit([
    model.$loading,
  ]);

  if (loading) return <PageLoading />;

  return (
    <>
      <Visualization
        model={model}
      />
      {/* TODO: Вынести в features/tree-members/preview
          Оно должно принимать только memeber и то через event.
          И оно должно принимать только slot's
       */}
      {/* <MemberDetailDrawer
        member={selectedMember}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editSlot={(
          <Button
              type="primary"
              icon={<EditOutlined />}
              block
              size="large"
              onClick={() => onEditMember?.(member)}
            >
              Edit Member
            </Button>
        )}
      /> */}
    </>
  );
};

export const component = FamilyTreeView;
export const createModel = factory;
