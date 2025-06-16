import React, { useEffect, useState, useCallback, useRef } from 'react';
import { exportResource, ExportResourceResponse } from '../services/api';
import ResourceManagement from './ResourceManagement';
import { HotTableProps } from '@handsontable/react'; // Handsontable の型をインポート
import Handsontable from 'handsontable'; // Handsontable の型をインポート
import * as TableUtils from './TableUtils';
import '../components/UserManagement.css';
import { extractTableDiffs } from './TableUtils';
import DiffDialogResource, { TableDiffData, DiffDialogResourceProps }  from './DiffDialogResource';

// 定数として削除列の情報を定義
const DELETE_COLUMN_DATA_KEY = '_deleted';
const DELETE_COLUMN_DEF: Handsontable.ColumnSettings = { data: DELETE_COLUMN_DATA_KEY, type: 'checkbox', className: 'delete-checkbox-col', width: 60 };
const DELETE_HEADER_LABEL = '削除';

const USERS_HEADERS = [
  'リソースID', 'ユーザー名', 'ロール外部コード', '組織外部コード', 'ログイン可否', 'ライセンスコード', 'ライセンス種別',
  '技術ライセンス', '業務ライセンス', 'ライセンスオプション1', 'ライセンスオプション2', '技術ライセンスオプション', '業務ライセンスオプション',
  'ログインID', 'パスワード', '認証タイプ', 'ドメイン名', '姓', '名', '役職', 'スキルレベル', '日単位稼働時間',
  'TEL', 'メール通知選択', 'メールアドレス', '検索オプション1', '検索オプション2', '外部コード', '説明'
];
const USERS_COLS = [
  { data: 'Id', readOnly: true }, { data: 'Name' }, { data: 'RoleReferenceCodes' }, { data: 'OrganizationReferenceCodes' }, { data: 'WhetherLogin', type: 'checkbox', default: false },
  { data: 'LicenceCode' }, { data: 'LicenceType' }, { data: 'RemLicence', type: 'checkbox', default: false }, { data: 'ProLicence', type: 'checkbox', default: false }, { data: 'LicenceOption1' },
  { data: 'LicenceOption2' }, { data: 'RemLicenceOption', type: 'checkbox', default: false }, { data: 'ProLicenceOption', type: 'checkbox', default: false }, { data: 'LoginId' }, { data: 'Password' },
  { data: 'AuthType' }, { data: 'DomainName' }, { data: 'LastName' }, { data: 'FirstName' }, { data: 'Office' }, { data: 'SkillLevel' },
  { data: 'OperatingHourByDay', type: 'numeric' }, { data: 'TelephoneNumber' }, { data: 'MailNotificationEnabled', type: 'checkbox', default: false }, { data: 'MailAddress' },
  { data: 'SearchOption1' }, { data: 'SearchOption2' }, { data: 'ReferenceCode' }, { data: 'Description' }
];

const EQUIP_HEADERS = [
  'リソースID', '設備名', '組織外部コード', '日単位稼働時間', 'TEL', 'メール通知選択', 'メールアドレス', '検索オプション1', '検索オプション2', '外部コード', '説明'
];
const EQUIP_COLS = [
  { data: 'Id', readOnly: true }, { data: 'Name' }, { data: 'OrganizationReferenceCodes' }, { data: 'OperatingHourByDay', type: 'numeric' },
  { data: 'TelephoneNumber' }, { data: 'MailNotificationEnabled', type: 'checkbox', default: false }, { data: 'MailAddress' }, { data: 'SearchOption1' },
  { data: 'SearchOption2' }, { data: 'ReferenceCode' }, { data: 'Description' }
];

const ORG_HEADERS = [
  'リソースID', '組織名', '親組織外部コード', '外部コード', '説明'
];
const ORG_COLS = [
  { data: 'Id', readOnly: true }, { data: 'Name' }, { data: 'ParentOrganizationReferenceCode' }, { data: 'ReferenceCode' }, { data: 'Description' }
];

const ROLE_HEADERS = [
  'リソースID', 'ロール名', '分類名', '外部コード', '説明'
];
const ROLE_COLS = [
  { data: 'Id', readOnly: true }, { data: 'Name' }, { data: 'Kind' }, { data: 'ReferenceCode' }, { data: 'Description' }
];

// --- データ型定義 ---
interface BaseResource {
  Id: string | null;
  Name: string | null;
  ReferenceCode?: string | null;
  Description?: string | null;
  [DELETE_COLUMN_DATA_KEY]?: boolean; // for edit mode
}

interface User extends BaseResource {
  RoleReferenceCodes?: string | null;
  OrganizationReferenceCodes?: string | null;
  WhetherLogin?: number | null;
  LicenceCode?: string | null;
  LicenceType?: string | null;
  RemLicence?: string | null;
  ProLicence?: string ;
  LicenceOption1?: string | null;
  LicenceOption2?: string | null;
  RemLicenceOption?: string | null;
  ProLicenceOption?: string | null;
  LoginId?: string | null;
  Password?: string | null;
  AuthType?: string | null;
  DomainName?: string | null;
  LastName?: string | null;
  FirstName?: string | null;
  Office?: string | null;
  SkillLevel?: string | null;
  OperatingHourByDay?: number | null;
  TelephoneNumber?: string | null;
  MailNotificationEnabled?: number | null;
  MailAddress?: string | null;
  SearchOption1?: string | null;
  SearchOption2?: string | null;
}

interface Equipment extends BaseResource {
  OrganizationReferenceCodes?: string | null;
  OperatingHourByDay?: number | null;
  TelephoneNumber?: string | null;
  MailNotificationEnabled?: number | null;
  MailAddress?: string | null;
  SearchOption1?: string | null;
  SearchOption2?: string | null;
}

interface Organization extends BaseResource {
  ParentOrganizationReferenceCode?: string | null;
}

interface Role extends BaseResource {
  Kind?: string | null;
}

// APIレスポンスの型 (仮定、実際のExportResourceResponseに合わせて調整が必要)
interface ApiUser extends Omit<User, typeof DELETE_COLUMN_DATA_KEY> {}
interface ApiEquipment extends Omit<Equipment, typeof DELETE_COLUMN_DATA_KEY> {}
interface ApiOrganization extends Omit<Organization, typeof DELETE_COLUMN_DATA_KEY> {}
interface ApiRole extends Omit<Role, typeof DELETE_COLUMN_DATA_KEY> {}

// ExportResourceResponseがこれらの型を含むと仮定
// interface ExportResourceResponse {
//   Users: ApiUser[];
//   Equipments: ApiEquipment[];
//   Organizations: ApiOrganization[];
//   Roles: ApiRole[];
// }


const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [equips, setEquips] = useState<Equipment[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [originalUsers, setOriginalUsers] = useState<User[]>([]);
  const [originalEquips, setOriginalEquips] = useState<Equipment[]>([]);
  const [originalOrgs, setOriginalOrgs] = useState<Organization[]>([]);
  const [originalRoles, setOriginalRoles] = useState<Role[]>([]);

  // const [data, setData] = useState<ExportResourceResponse | null>(null); // Keep if needed for other purposes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResourceManagementOpen, setIsResourceManagementOpen] = useState(true); // Renamed for clarity
  const [editMode, setEditMode] = useState(false);

  const [diffDialogOpen, setDiffDialogOpen] = useState(false);
  const [diffDialogData, setDiffDialogData] = useState<DiffDialogResourceProps['diffData']>({});

  // editModeの最新値をafterChangeハンドラ内で参照するためのref
  const editModeRef = useRef(editMode);
  useEffect(() => {
    editModeRef.current = editMode;
  }, [editMode]);

  // 型Tの配列を受け取り、各要素に_deleted: false を付与して返すジェネリック関数
  const initializeDataWithDeleteFlag = <T extends BaseResource>(data: T[]): (T & { [key: string]: boolean })[] => {
    return JSON.parse(JSON.stringify(data.map(item => ({ ...item, [DELETE_COLUMN_DATA_KEY]: false }))));
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await exportResource();
        // APIからのデータに型を適用し、_deletedフラグを初期化
        const apiUsers = (Array.isArray(res.Users) ? res.Users : []) as ApiUser[];
        const apiEquips = (Array.isArray(res.Equipments) ? res.Equipments : []) as ApiEquipment[];
        const apiOrgs = (Array.isArray(res.Organizations) ? res.Organizations : []) as ApiOrganization[];
        const apiRoles = (Array.isArray(res.Roles) ? res.Roles : []) as ApiRole[];

        setUsers(initializeDataWithDeleteFlag(apiUsers));
        setEquips(initializeDataWithDeleteFlag(apiEquips));
        setOrgs(initializeDataWithDeleteFlag(apiOrgs));
        setRoles(initializeDataWithDeleteFlag(apiRoles));

        setOriginalUsers(initializeDataWithDeleteFlag(apiUsers));
        setOriginalEquips(initializeDataWithDeleteFlag(apiEquips));
        setOriginalOrgs(initializeDataWithDeleteFlag(apiOrgs));
        setOriginalRoles(initializeDataWithDeleteFlag(apiRoles));

        // setData(res);
      } catch (e) {
        setError('データ取得に失敗しました');
        console.error('exportResource error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 型Tの配列を受け取り、各要素に_deletedプロパティを保証するジェネリック関数
  const ensureDeleteProperty = <T extends BaseResource>(data: T[]): T[] => {
    return data.map(row => ({
      ...row,
      [DELETE_COLUMN_DATA_KEY]: row[DELETE_COLUMN_DATA_KEY] === undefined ? false : row[DELETE_COLUMN_DATA_KEY]
    })) as T[]; // キャストしてT[]に合わせる
  };

  const handleEditStart = () => {
    setEditMode(true);

    const usersWithDelete = ensureDeleteProperty(JSON.parse(JSON.stringify(users)));
    const equipsWithDelete = ensureDeleteProperty(JSON.parse(JSON.stringify(equips)));
    const orgsWithDelete = ensureDeleteProperty(JSON.parse(JSON.stringify(orgs)));
    const rolesWithDelete = ensureDeleteProperty(JSON.parse(JSON.stringify(roles)));

    setUsers(usersWithDelete);
    setEquips(equipsWithDelete);
    setOrgs(orgsWithDelete);
    setRoles(rolesWithDelete);

    setOriginalUsers(JSON.parse(JSON.stringify(usersWithDelete)));
    setOriginalEquips(JSON.parse(JSON.stringify(equipsWithDelete)));
    setOriginalOrgs(JSON.parse(JSON.stringify(orgsWithDelete)));
    setOriginalRoles(JSON.parse(JSON.stringify(rolesWithDelete)));
  };

  const handleEditCancel = () => {
    setEditMode(false);
    // Revert to original data
    // originalUsers等には handleEditStart で _deleted が付与されているはずだが、念のため再付与
    setUsers(ensureDeleteProperty(JSON.parse(JSON.stringify(originalUsers))));
    setEquips(ensureDeleteProperty(JSON.parse(JSON.stringify(originalEquips))));
    setOrgs(ensureDeleteProperty(JSON.parse(JSON.stringify(originalOrgs))));
    setRoles(ensureDeleteProperty(JSON.parse(JSON.stringify(originalRoles))));
  };

  const handleAddRow = (type: 'Users' | 'Equipments' | 'Organizations' | 'Roles') => {
    if (!editMode) return;
    const createNewRow = (cols: Handsontable.ColumnSettings[]) => {
      // Filter for columns where 'data' is a string, as expected by TableUtils.createEmptyRow
      const validColsForEmptyRow = cols.filter(
        (col): col is { data: string } & Handsontable.ColumnSettings => typeof col.data === 'string'
      );
      return { ...TableUtils.createEmptyRow(validColsForEmptyRow), [DELETE_COLUMN_DATA_KEY]: false };
    };

    if (type === 'Users') { setUsers(prev => [...prev, createNewRow(USERS_COLS)]); }
    if (type === 'Equipments') { setEquips(prev => [...prev, createNewRow(EQUIP_COLS)]); }
    if (type === 'Organizations') { setOrgs(prev => [...prev, createNewRow(ORG_COLS)]); }
    if (type === 'Roles') { setRoles(prev => [...prev, createNewRow(ROLE_COLS)]); }
  };

  const handleEditEnd = () => {
    const collectedDiffs: DiffDialogResourceProps['diffData'] = {};

    const processTableDiffs = (original: any[], current: any[], tableName: string, headers: string[], cols: any[]): TableDiffData | null => {
      const diffsRaw = extractTableDiffs(original as any[], current as any[]); // extractTableDiffsがany[]を期待する場合

      if (diffsRaw.length > 0) {
        const dialogDiffs = diffsRaw.map(d => {
          let effectiveType = d.type;
          // 既存行が「削除」にマークされた、または新規行が追加されて即「削除」にマークされた場合
          if ((d.type === 'updated' && d.after?.[DELETE_COLUMN_DATA_KEY] === true && d.before?.[DELETE_COLUMN_DATA_KEY] === false) ||
              (d.type === 'added' && d.after?.[DELETE_COLUMN_DATA_KEY] === true)) {
            effectiveType = 'deleted';
          }

          // 「削除」と判断された行のデータは、削除前の状態（d.before）か、追加されてすぐ削除ならd.after（_deletedフラグは残す）
          // それ以外のタイプは d.after を使用
          const displayData = (effectiveType === 'deleted' && d.type === 'updated') ? d.before : d.after;

          return { ...displayData, type: effectiveType, [DELETE_COLUMN_DATA_KEY]: d.after?.[DELETE_COLUMN_DATA_KEY] };
        });

        return {
          diffs: dialogDiffs,
          beforeRows: diffsRaw.map(d => d.before || {}),
          rowIndexes: diffsRaw.map(d => d.rowIndex),
          colHeaders: headers, // 基本のヘッダー（「削除」列なし）
          columns: cols,     // 基本のカラム定義（「削除」列なし）
          tableName: tableName,
        };
      }
      return null;
    };

    const usersDiffResult = processTableDiffs(originalUsers, users, 'Users', USERS_HEADERS, USERS_COLS.filter(c => c.data !== DELETE_COLUMN_DATA_KEY));
    if (usersDiffResult) collectedDiffs.users = usersDiffResult;

    const equipsDiffResult = processTableDiffs(originalEquips, equips, 'Equipments', EQUIP_HEADERS, EQUIP_COLS.filter(c => c.data !== DELETE_COLUMN_DATA_KEY));
    if (equipsDiffResult) collectedDiffs.equips = equipsDiffResult;

    const orgsDiffResult = processTableDiffs(originalOrgs, orgs, 'Organizations', ORG_HEADERS, ORG_COLS.filter(c => c.data !== DELETE_COLUMN_DATA_KEY));
    if (orgsDiffResult) collectedDiffs.orgs = orgsDiffResult;

    const rolesDiffResult = processTableDiffs(originalRoles, roles, 'Roles', ROLE_HEADERS, ROLE_COLS.filter(c => c.data !== DELETE_COLUMN_DATA_KEY));
    if (rolesDiffResult) collectedDiffs.roles = rolesDiffResult;

    if (Object.keys(collectedDiffs).length > 0) {
      setDiffDialogData(collectedDiffs);
      setDiffDialogOpen(true);
    } else {
      setEditMode(false); // No changes, just exit edit mode
    }
  };

  const createChangeHandler = (
    setData: React.Dispatch<React.SetStateAction<BaseResource[]>> // より具体的な型を使用
  ) => {
    return function(this: Handsontable.Core, changes: Handsontable.CellChange[] | null, source: Handsontable.ChangeSource) {
      if (source === 'loadData' || !editModeRef.current) return;
      if (changes && changes.length > 0) {
        setData(this.getSourceDataArray()); // HandsontableのデータをReact Stateに同期
      }
    };
  };

  const usersChangeHandler = useCallback(createChangeHandler(setUsers as React.Dispatch<React.SetStateAction<BaseResource[]>>), [setUsers]);
  const equipsChangeHandler = useCallback(createChangeHandler(setEquips as React.Dispatch<React.SetStateAction<BaseResource[]>>), [setEquips]);
  const orgsChangeHandler = useCallback(createChangeHandler(setOrgs as React.Dispatch<React.SetStateAction<BaseResource[]>>), [setOrgs]);
  const rolesChangeHandler = useCallback(createChangeHandler(setRoles as React.Dispatch<React.SetStateAction<BaseResource[]>>), [setRoles]);


  const hotCommon: Partial<HotTableProps> = {
    rowHeaders: true,
    width: '100%',
    height: 300, // Auto can sometimes be problematic, fixed height or minHeight might be better
    licenseKey: 'non-commercial-and-evaluation',
    readOnly: !editMode,
    className: 'user-management-table',
    stretchH: 'all',
    manualColumnResize: true
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, color: 'red' }}>{error}</div>;

  // 動的にカラムとヘッダーを編集モードに応じて変更
  const getEffectiveCols = (baseCols: Handsontable.ColumnSettings[]) => editMode ? [DELETE_COLUMN_DEF, ...baseCols] : baseCols;
  const getEffectiveHeaders = (baseHeaders: string[]) => editMode ? [DELETE_HEADER_LABEL, ...baseHeaders] : baseHeaders;


  // if (!data) return null; // Removed as data state is not the primary source of truth for tables anymore

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, background: '#ffffff', borderRadius: 4, padding: '8px 16px' }}>
        <button
          className={`toggle-btn${isResourceManagementOpen ? ' open' : ''}`}
          onClick={() => setIsResourceManagementOpen(v => !v)}
          style={{ backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', outline: 'none', padding: '0 10px', userSelect: 'none', marginRight: 8, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label={isResourceManagementOpen ? '折りたたむ' : '展開する'}
        >
          {isResourceManagementOpen ? 'ー' : '＋'}
        </button>
        <span style={{ fontWeight: 'bold', fontSize: 18, color: 'Black' }}>リソース管理</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {!editMode && (
            <button
              onClick={handleEditStart}
              style={{ padding: '6px 12px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              編集開始
            </button>
          )}
          {editMode && (
            <>
              <button
                onClick={handleEditEnd}
                style={{ padding: '6px 12px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                編集完了
              </button>
              <button
                onClick={handleEditCancel}
                style={{ padding: '6px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                キャンセル
              </button>
            </>
          )}
        </div>
      </div>
      <ResourceManagement
        open={isResourceManagementOpen}
        editMode={editMode}
        users={users}
        equips={equips}
        orgs={orgs}
        roles={roles}
        originalUsers={originalUsers}
        originalEquips={originalEquips}
        originalOrgs={originalOrgs}
        originalRoles={originalRoles}
        handleAddRow={handleAddRow}
        hotCommon={hotCommon}
        onUsersChange={usersChangeHandler}
        onEquipsChange={equipsChangeHandler}
        onOrgsChange={orgsChangeHandler}
        onRolesChange={rolesChangeHandler}
        usersHeaders={getEffectiveHeaders(USERS_HEADERS)} usersCols={getEffectiveCols(USERS_COLS)}
        equipHeaders={getEffectiveHeaders(EQUIP_HEADERS)} equipCols={getEffectiveCols(EQUIP_COLS)}
        orgHeaders={getEffectiveHeaders(ORG_HEADERS)} orgCols={getEffectiveCols(ORG_COLS)}
        roleHeaders={getEffectiveHeaders(ROLE_HEADERS)} roleCols={getEffectiveCols(ROLE_COLS)}
      />
      {diffDialogOpen && (
        <DiffDialogResource
          open={diffDialogOpen}
          onClose={() => {
            setDiffDialogOpen(false);
            setEditMode(false); // Close dialog also exits edit mode
          }}
          diffData={diffDialogData}
          title="リソース変更内容の確認"
          // onReload={fetchDataFunction} // TODO: Implement data reload if needed after server write
        />
      )}
    </div>
  );
};

export default UserManagement;
