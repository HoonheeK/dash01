import axios from 'axios';
const BASE_URL = '/api';

class ApiService {
  static authToken: string = '';

  static axiosInstance = axios.create();

  static async authenticate() {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('username', 'api_su');
      params.append('password', 'api_su');

      const response = await this.axiosInstance.post<any>(`${BASE_URL}/token`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.authToken = `${response.data.token_type} ${response.data.access_token}`;
      return true;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  static async getCustomAttributes(): Promise<CustomAttribute[]> {
    try {
      // If no auth token exists, authenticate first
      if (!this.authToken) {
        const authenticated = await this.authenticate();
        if (!authenticated) {
          throw new Error('Authentication failed');
        }
      }
      const response = await this.axiosInstance.get<CustomAttribute[]>(`${BASE_URL}/v1/admin/customAttributes?count=0`, {
        headers: {
          'Authorization': this.authToken
        },
        timeout: 10000 // 10 seconds timeout
      });

      // --- ここでDisplayLabelsをテーブル用にフラット化 ---
      const transformed = response.data.map(attr => {
        // DisplayLabels配列をDisplayLabel_{lang}プロパティに展開
        const flatLabels: Record<string, string> = {};
        if (Array.isArray(attr.DisplayLabels)) {
          attr.DisplayLabels.forEach(dl => {
            flatLabels[`DisplayLabel_${dl.Language}`] = dl.DisplayLabel;
          });
        }
        return {
          ...attr,
          ...flatLabels
        };
      });
      return transformed;
    } catch (error) {
      console.error('Failed to fetch custom attributes:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.authToken = '';
        return this.getCustomAttributes();
      }
      throw error;
    }
  }

  static async getClasses(): Promise<ClassData[]> {
    try {
      if (!this.authToken) {
        const authenticated = await this.authenticate();
        if (!authenticated) {
          throw new Error('Authentication failed');
        }
      }
      const response = await this.axiosInstance.get<ClassData[]>(`${BASE_URL}/v1/admin/classes?count=0`, {
        headers: {
          'Authorization': this.authToken
        },
        timeout: 10000 // 10 seconds timeout
      });
      // ClassDataにはDisplayLabelsのようなネスト構造はないため、
      // getCustomAttributesのようなフラット化処理は不要です。
      console.log('getClasses RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch class data:', error);
      return [];
    }
  }
}

// --- exportResource API追加 ---
export interface ExportResourceResponse {
  Users: any[];
  Equipments: any[];
  Organizations: any[];
  Roles: any[];
}

export const exportResource = async (): Promise<ExportResourceResponse> => {
  if (!ApiService.authToken) {
    const authenticated = await ApiService.authenticate();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
  }
  const response = await ApiService.axiosInstance.get(`${BASE_URL}/v1/admin/exportResource`, {
    headers: {
      Authorization: ApiService.authToken,
    },
  });
  return response.data;
};


// --- カスタム属性 更新API（PUT版） ---
export async function putCustomAttribute(id: string, data: any): Promise<any> {
  if (!ApiService.authToken) {
    const authenticated = await ApiService.authenticate();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
  }
  try {
    console.log('putCustomAttribute REQUEST:', {
      url: `${BASE_URL}/v1/admin/customAttributes/${id}`,
      data,
      headers: {
        Authorization: ApiService.authToken,
        'Content-Type': 'application/json',
      },
    });
    const response = await ApiService.axiosInstance.put(
      `${BASE_URL}/v1/admin/customAttributes/${id}`,
      data,
      {
        headers: {
          Authorization: ApiService.authToken,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('putCustomAttribute response:', response); 
    return response.data;
  } catch (error) {
    console.error('putCustomAttribute error:', error);
    throw error;
  }
}

// --- カスタム属性 新規追加API（POST版） ---
export async function postCustomAttribute(data: any): Promise<any> {
  if (!ApiService.authToken) {
    const authenticated = await ApiService.authenticate();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
  }
  // ProjectID, BarColor のデフォルト値補完
  let postData = {
    ...data,
    ProjectId: data.ProjectId || '00000000-0000-0000-0000-000000000000',
    BarColor: data.BarColor || '#FF00FF',
    Target: data.Target || '',
    InputType: data.InputType || '',
  };
  // _deletedはPOSTデータから除外
  if ('_deleted' in postData) {
    const { _deleted, ...rest } = postData;
    postData = rest;
  }
  // DisplayLabel_xx → DisplayLabels配列に変換
  const displayLabels: { Language: string; DisplayLabel: string }[] = [];
  Object.keys(postData).forEach(key => {
    if (key.startsWith('DisplayLabel_')) {
      const lang = key.replace('DisplayLabel_', '');
      displayLabels.push({ Language: lang, DisplayLabel: postData[key] });
      delete postData[key];
    }
  });
  // postData.DisplayLabels = displayLabels;  // Postデータは、フラット化は不要。
  try {
    console.log('postCustomAttribute REQUEST:', {
      url: `${BASE_URL}/v1/admin/customAttributes/`,
      data: postData,
      headers: {
        Authorization: ApiService.authToken,
        'Content-Type': 'application/json',
      },
    });
    const response = await ApiService.axiosInstance.post(
      `${BASE_URL}/v1/admin/customAttributes/`,
      postData,
      {
        headers: {
          Authorization: ApiService.authToken,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('postCustomAttribute response:', response);
    return response.data;
  } catch (error) {
    console.error('postCustomAttribute error:', error);
    throw error;
  }
}

// --- カスタム属性 削除API（DELETE版） ---
export async function deleteCustomAttribute(id: string): Promise<any> {
  if (!ApiService.authToken) {
    const authenticated = await ApiService.authenticate();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
  }
  try {
    console.log('deleteCustomAttribute REQUEST:', {
      url: `${BASE_URL}/v1/admin/customAttributes/${id}`,
      headers: {
        Authorization: ApiService.authToken,
      },
    });
    const response = await ApiService.axiosInstance.delete(
      `${BASE_URL}/v1/admin/customAttributes/${id}`,
      {
        headers: {
          Authorization: ApiService.authToken,
        },
      }
    );
    console.log('deleteCustomAttribute response:', response);
    return response.data;
  } catch (error) {
    console.error('deleteCustomAttribute error:', error);
    throw error;
  }
}

// --- クラス更新API ---
export async function putClass(id: string, data: Omit<ClassData, 'Id'>): Promise<any> {
  if (!ApiService.authToken) {
    const authenticated = await ApiService.authenticate();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
  }
  try {
    // フロントエンドで管理される可能性のあるプロパティを除去 (例: _deleted)
    // APIが期待する形式にデータを整形
    let putData = { ...data };
    if ('_deleted' in putData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _deleted, ...rest } = putData as any; // _deleted が ClassData にはないため any にキャスト
      putData = rest;
    }

    console.log('putClass REQUEST:', {
      url: `${BASE_URL}/v1/admin/classes/${id}`,
      data: putData,
      headers: {
        Authorization: ApiService.authToken,
        'Content-Type': 'application/json',
      },
    });
    const response = await ApiService.axiosInstance.put(
      `${BASE_URL}/v1/admin/classes/${id}`,
      putData,
      {
        headers: {
          Authorization: ApiService.authToken,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('putClass RESPONSE:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating class ${id}:`, error);
    // 401エラーの場合は再認証を試みる (getCustomAttributesと同様の処理)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      ApiService.authToken = ''; // トークンをクリア
      return putClass(id, data); // 再帰呼び出しで再試行
    }
    throw error;
  }
}

// --- クラス新規追加API ---
export async function postClass(data: Omit<ClassData, 'Id'>): Promise<ClassData> {
  if (!ApiService.authToken) {
    const authenticated = await ApiService.authenticate();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
  }
  // ProjectId のデフォルト値補完 (必須フィールドのため)
  // ReferenceCode も必須だが、これは呼び出し側で設定される想定
  let postData = {
    ...data,
    ProjectId: data.ProjectId || '00000000-0000-0000-0000-000000000000',
    // 他にデフォルトで設定したい値があればここに追加
  };
  // フロントエンドで管理される可能性のあるプロパティを除去 (例: _deleted)
  if ('_deleted' in postData) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _deleted, ...rest } = postData as any; // _deleted が ClassData にはないため any にキャスト
    postData = rest;
  }

  try {
    console.log('postClass REQUEST:', {
      url: `${BASE_URL}/v1/admin/classes`,
      data: postData,
      headers: {
        Authorization: ApiService.authToken,
        'Content-Type': 'application/json',
      },
    });
    const response = await ApiService.axiosInstance.post(`${BASE_URL}/v1/admin/classes`, postData, {
      headers: {
        Authorization: ApiService.authToken,
        'Content-Type': 'application/json',
      },
    });
    console.log('postClass RESPONSE:', response.data);
    return response.data as ClassData;
  } catch (error) {
    console.error('Error creating class:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      ApiService.authToken = '';
      return postClass(data);
    }
    throw error;
  }
}

// --- Project 타입 정의 ---
export interface Project {
  Id: string;
  Name: string;
  ProductAxisGroupAttribute: string;
  // API 응답에 따라 다른 필드가 있을 수 있습니다.
}

// --- プロジェクト取得API ---
export async function getProjects(): Promise<Project[]> {
  if (!ApiService.authToken) {
    const authenticated = await ApiService.authenticate();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
  }
  try {
    console.log('getProjects REQUEST:', {
      url: `${BASE_URL}/v1/projects?count=0`,
      headers: {
        Authorization: ApiService.authToken,
      },
    });
    const response = await ApiService.axiosInstance.get(`${BASE_URL}/v1/projects?count=0`, {
      headers: {
        Authorization: ApiService.authToken,
      },
    });
    console.log('getProjects RESPONSE:', response.data);
    return response.data as Project[]; // API 응답이 Project 배열임을 명시
  } catch (error) {
    console.error('Error fetching projects:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      ApiService.authToken = '';
      return getProjects();
    }
    throw error;
  }
}

// --- 중첩된 타입 정의 ---
interface CalendarDay {
  Day: string;
  OperatingDay: boolean;
}

interface CalendarData {
  Sunday: boolean;
  Monday: boolean;
  Tuesday: boolean;
  Wednesday: boolean;
  Thursday: boolean;
  Friday: boolean;
  Saturday: boolean;
  Days: CalendarDay[];
}

interface CustomAttributeEntry {
  Id: string;
  Key: string;
  Value: string;
}

interface AssignEntry {
  Id: string;
  LoginId: string;
  Name: string;
  AssignedManHour: number;
  AssignedRate: number;
  ReferenceCode?: string; // Optional based on JSON
  Order?: number;         // Optional based on JSON
}

interface ProgressData {
  Status: string; // "NotStart", "OnGoing", "Complete", etc.
  ProgressRate: number;
  ActualManHour: number;
  Note?: string;
  Memo?: string;
  StartDate?: string;
  EndDate?: string;
  CustomAttributes?: CustomAttributeEntry[];
  Assigns?: { // Progress.Assigns might have a different structure
    Id: string;
    LoginId: string;
    Name: string;
    ActualManHour: number;
    ReferenceCode?: string;
  }[];
}

interface ClassInfo {
  Id: string;
  Name: string;
}

interface TagInfo {
  Id: string;
  Name: string;
}

// --- Task 타입 정의 ---
// 실제 API 응답에 맞게 필드를 조정해야 합니다.
export interface Task {
  Id: string;
  Name: string;
  Type: string;
  StartDate?: string;
  EndDate?: string;
  PlannedDuration?: number;
  ParentTaskId?: string;
  PhaseId?: string;
  Priority?: string;
  CustomAttributes?: CustomAttributeEntry[]; // 중첩 배열
  Progress?: ProgressData; // 중첩 객체
  Class?: ClassInfo; // 중첩 객체
  Assigns?: AssignEntry[]; // 담당자 정보
  Tags?: TagInfo[]; // 태그 정보
  ProjectId: string;
  // 필요에 따라 더 많은 최상위 또는 평탄화된 필드를 추가
  // 예: taskStatus: string (Progress.Status에서 가져옴)
  // 예: primaryAssigneeName?: string (Assigns[0].Name 에서 가져옴)
}

// --- 프로젝트별 Task 목록 조회 API ---
export async function getTasksForProject(projectId: string): Promise<Task[]> {
  if (!ApiService.authToken) {
    const authenticated = await ApiService.authenticate();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
  }
  try {
    // 'Assigns'와 'Progress' 정보를 포함하도록 params 추가
    const response = await ApiService.axiosInstance.get<Task[]>(`${BASE_URL}/v1/projects/${projectId}/tasks`, {
      headers: {
        Authorization: ApiService.authToken,
      },
      params: {
        include: 'Assigns,Progress', // API가 이 파라미터를 지원한다고 가정합니다.
      },
    });
    console.log(`getTasksForProject (projectId: ${projectId}) RESPONSE:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks for project ${projectId}:`, error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      ApiService.authToken = ''; // 토큰을 클리어
      return getTasksForProject(projectId); // 재귀 호출로 재시도
    }
    throw error;
  }
}

// --- クラス削除API ---
export async function deleteClass(id: string): Promise<any> {
  if (!ApiService.authToken) {
    const authenticated = await ApiService.authenticate();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
  }
  try {
    console.log('deleteClass REQUEST:', {
      url: `${BASE_URL}/v1/admin/classes/${id}`,
      headers: {
        Authorization: ApiService.authToken,
      },
    });
    const response = await ApiService.axiosInstance.delete(
      `${BASE_URL}/v1/admin/classes/${id}`,
      {
        headers: {
          Authorization: ApiService.authToken,
        },
      }
    );
    console.log('deleteClass RESPONSE:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting class ${id}:`, error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      ApiService.authToken = '';
      return deleteClass(id);
    }
    throw error;
  }
}

// 型定義
export type DisplayLabel = {
  Language: string;
  DisplayLabel: string;
};

export type CustomAttribute = {
  SystemCategory: string;
  Import: boolean;
  Target: string;
  AttributeID: string;
  DisplayLabels: DisplayLabel[];
  InputType: string;
  DisplayType: string;
  Integer: number;
  Decimal: number;
  ExponentNotation: boolean;
  SignificantDigit: number;
  Required: boolean;
  ReadOnly: boolean;
  ReferenceUpdate: boolean;
};

export type ClassData = {
  Id: string; // ★APIレスポンスに含まれるID
  SystemCategory: string;
  Import: boolean;
  DataType: string;
  Name: string;
  Category: string;
  BackColor: string;
  ForeColor: string;
  Active: boolean;
  ProjectId: string; // POST時に必須 (固定値想定)
  ReferenceCode: string; // POST時に必須
};

export default ApiService;