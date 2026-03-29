import {
  DownloadOutlined,
  ShareAltOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { FamilyTreeMemberGetResponseType } from '@family-tree/shared';
import { theme } from 'antd';
import { Link } from 'atomic-router-react';
import { useUnit } from 'effector-react';
import * as f3 from 'family-chart';
import 'family-chart/styles/family-chart.css';
import html2canvas from 'html2canvas';
import { useCallback, useEffect, useRef } from 'react';
import { ShareTreeModal, shareTreeModel } from '~/features/tree-detail/share';
import { addMemberModel } from '~/features/tree-member/add';
import { previewMemberModel } from '~/features/tree-member/preview';
import { routes } from '~/shared/config/routing';
import { errorFx } from '~/shared/lib/message';
import type {
  F3Chart,
  F3Datum,
  F3NodeDatum,
} from '~/shared/lib/family-chart-transformer';
import { toF3Data } from '~/shared/lib/family-chart-transformer';
import '~/shared/styles/family-chart-custom.css';
import type { Props } from './ui';

/** family-chart ships without TS declarations; cast to our minimal interface. */
type F3Module = { createChart: (el: HTMLElement, data: F3Datum[]) => F3Chart };

export const Visualization: React.FC<Props> = ({ model }) => {
  const [connections, members, id, tree, isOwner, lastAddedMemberId] = useUnit([
    model.$connections,
    model.$members,
    model.$id,
    model.$tree,
    model.$isOwner,
    addMemberModel.$lastAddedMemberId,
  ]);
  const { token } = theme.useToken();

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<F3Chart | null>(null);
  const membersMapRef = useRef(
    new Map<string, FamilyTreeMemberGetResponseType>(),
  );
  const hasFirstDataRef = useRef(false);
  const isOwnerRef = useRef(false);
  const lastAddedMemberIdRef = useRef<string | null>(null);
  const treeNameRef = useRef<string | null>(null);

  // Sync refs with latest render values so stale closures always read current data
  isOwnerRef.current = isOwner;
  lastAddedMemberIdRef.current = lastAddedMemberId;
  treeNameRef.current = tree?.name ?? null;

  useEffect(() => {
    membersMapRef.current = new Map(
      members.map((m): [string, FamilyTreeMemberGetResponseType] => [m.id, m]),
    );
  }, [members]);

  // ── Initialize chart once on mount ──────────────────────────
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const chart = (f3 as unknown as F3Module).createChart(container, []);

    // Disable phantom "add parent" placeholder nodes — we handle this with our own buttons.
    // Phantom nodes bloat tree.dim causing treeFit to use wrong scale.
    chart.setSingleParentEmptyCard(false);

    chart
      .setCardHtml()
      // img_w/h/x/y = 0 → let CSS flex layout handle image sizing (no inline style conflicts)
      .setCardDim({ w: 220, h: 70, img_w: 0, img_h: 0, img_x: 0, img_y: 0 })
      .setCardDisplay([
        (d: F3Datum) => d.data.name,
        (d: F3Datum) => d.data.dob ?? '',
      ])
      .setCardImageField('image')
      .setOnCardUpdate(function (this: HTMLElement, d: F3NodeDatum) {
        // `this` = card_cont wrapper (a positioned point in the SVG)
        // `.card` = inner div with transform:translate(-50%,-50%), acts as containing block
        this.classList.add('ft-card-wrap');

        // JS hover tracking with a short delay on leave so the cursor can
        // cross the gap between the card edge and the outside-positioned buttons
        if (!this.dataset.hoverBound) {
          this.dataset.hoverBound = '1';

          let leaveTimer: ReturnType<typeof setTimeout>;

          this.addEventListener('mouseover', () => {
            clearTimeout(leaveTimer);

            this.classList.add('is-hovered');
          });

          this.addEventListener('mouseout', (e: MouseEvent) => {
            if (!this.contains(e.relatedTarget as Node)) {
              leaveTimer = setTimeout(
                () => this.classList.remove('is-hovered'),
                150,
              );
            }
          });
        }

        // Remove stale action buttons before re-rendering
        this.querySelector('.ft-actions')?.remove();

        const hasSpouse = d.data.rels.spouses.length > 0;
        const hasParents = d.data.rels.parents.length > 0;
        const isMale = d.data.data.gender === 'M';
        const spouseColor = isMale ? '#ec4899' : '#3b82f6';
        const spouseBorder = isMale ? '#be185d' : '#1e40af';
        const memberId = d.data.id;

        const actions = document.createElement('div');

        actions.className = 'ft-actions';

        actions.innerHTML = `<button
          class="ft-btn ft-btn-preview"
          data-action="preview"
          data-member-id="${memberId}"
          title="View details"
          aria-label="View details"
        >👁</button>`;

        if (isOwnerRef.current && !hasParents) {
          actions.innerHTML += `<button
            class="ft-btn ft-btn-parents"
            data-action="add-parents"
            data-member-id="${memberId}"
            title="Add parents"
            aria-label="Add parents"
          >⬆</button>`;
        }

        if (isOwnerRef.current && !hasSpouse) {
          actions.innerHTML += `<button
            class="ft-btn ft-btn-spouse"
            data-action="add-spouse"
            data-member-id="${memberId}"
            style="background:${spouseColor};border-color:${spouseBorder}"
            title="Add spouse"
            aria-label="Add spouse"
          >+</button>`;
        }

        if (isOwnerRef.current && hasSpouse && !isMale) {
          actions.innerHTML += `<button
            class="ft-btn ft-btn-boy"
            data-action="add-boy"
            data-member-id="${memberId}"
            title="Add son"
            aria-label="Add son"
          >♂</button>
          <button
            class="ft-btn ft-btn-girl"
            data-action="add-girl"
            data-member-id="${memberId}"
            title="Add daughter"
            aria-label="Add daughter"
          >♀</button>`;
        }

        // Append to .card so buttons are positioned relative to its coordinate space
        const card = this.querySelector('.card');
        if (card) card.appendChild(actions);
      });

    chartRef.current = chart;

    return () => {
      container.innerHTML = '';
      chartRef.current = null;
      hasFirstDataRef.current = false;
    };
  }, []);

  // ── Sync data whenever members / connections change ──────────
  useEffect(() => {
    if (!chartRef.current || members.length === 0) return;

    const focusId = lastAddedMemberIdRef.current;
    const data = toF3Data(members, connections, focusId);

    chartRef.current.updateData(data);

    if (!hasFirstDataRef.current) {
      // First load: fit all members in view
      hasFirstDataRef.current = true;

      requestAnimationFrame(() => {
        chartRef.current?.updateTree({ initial: true, transition_time: 0 });
      });
    } else if (focusId) {
      // After adding a member: fly to the newly created one
      addMemberModel.lastAddedMemberIdTrigger();

      requestAnimationFrame(() => {
        chartRef.current?.updateTree({
          tree_position: 'main_to_middle',
          transition_time: 400,
        });
      });
    } else {
      chartRef.current.updateTree({
        tree_position: 'inherit',
        transition_time: 300,
      });
    }
  }, [members, connections]);

  // ── Event delegation for card action buttons ─────────────────
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const btn = (e.target as Element).closest(
        '[data-action]',
      ) as HTMLElement | null;

      if (!btn) return;

      e.stopPropagation();

      const action = btn.dataset.action;
      const memberId = btn.dataset.memberId;

      if (!action || !memberId) return;

      const member = membersMapRef.current.get(memberId);

      if (!member) return;

      switch (action) {
        case 'preview':
          previewMemberModel.previewMemberTrigger(member);

          break;
        case 'add-boy':
          addMemberModel.addBoyTrigger(member);

          break;
        case 'add-girl':
          addMemberModel.addGirlTrigger(member);

          break;
        case 'add-spouse':
          addMemberModel.addSpouseTrigger(member);

          break;
        case 'add-parents':
          addMemberModel.addParentsTrigger(member);

          break;
      }
    };

    container.addEventListener('click', handleClick);

    return () => container.removeEventListener('click', handleClick);
  }, []);

  // ── Toolbar handlers ─────────────────────────────────────────
  const handleCenterView = useCallback(() => {
    chartRef.current?.updateTree({
      tree_position: 'main_to_middle',
      transition_time: 400,
    });
  }, []);

  const handleDownloadImage = useCallback(async () => {
    const container = containerRef.current;

    if (!container) return;

    const filename = treeNameRef.current
      ? `${treeNameRef.current}-famtree.png`
      : 'famtree.png';

    try {
      const canvas = await html2canvas(container, {
        backgroundColor: 'rgba(249, 250, 251, 0.9)',
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      errorFx('Failed to export image');
    }
  }, []);

  if (!id) return null;

  return (
    <div
      className="w-full p-4 select-none relative"
      style={{ height: 'calc(103vh - 160px)' }}
    >
      <ShareTreeModal />

      {/* Toolbar */}
      <div className="absolute top-8 right-8 z-10 flex gap-2">
        <Link
          to={routes.sharedTreeUsers}
          params={{ id }}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer flex items-center justify-center"
          title="Shared Users"
        >
          <TeamOutlined style={{ fontSize: '24px', color: '#595959' }} />
        </Link>
        <button
          type="button"
          onClick={() =>
            shareTreeModel.shareTrigger({ url: window.location.href })
          }
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer"
          title="Share Tree"
        >
          <ShareAltOutlined style={{ fontSize: '24px', color: '#595959' }} />
        </button>
        <button
          type="button"
          onClick={handleDownloadImage}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer"
          title="Convert to Image"
        >
          <DownloadOutlined style={{ fontSize: '24px', color: '#595959' }} />
        </button>
        <button
          type="button"
          onClick={handleCenterView}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer"
          title="Center Tree"
        >
          <img
            src="/family-tree-icon.png"
            alt="Center Tree"
            className="w-6 h-6 object-contain"
          />
        </button>
      </div>

      {/* family-chart container */}
      <div
        ref={containerRef}
        id="FamilyChart"
        className="w-full h-full f3"
        style={{
          background: 'rgba(249, 250, 251, 0.9)',
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          overflow: 'hidden',
        }}
      />
    </div>
  );
};
