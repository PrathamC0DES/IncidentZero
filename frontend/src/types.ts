export interface AgentStep {
  id: number;
  agent_name: string;
  step_type: string;
  content: string;
  meta_info?: Record<string, any>;
  tokens_used: number;
  created_at: string;
}

export interface Incident {
  id: string;
  title: string;
  service_name: string;
  error_type: string;
  error_message: string;
  stack_trace: string;
  status: 'RECEIVED' | 'INVESTIGATING' | 'REPRODUCING' | 'FIXING' | 'AUDITING' | 'HEALED' | 'PR_CREATED' | 'FAILED';
  repo_url?: string;
  target_branch: string;
  root_cause_analysis?: string;
  reproduced_test_code?: string;
  patch_diff?: string;
  pull_request_url?: string;
  iterations_used: number;
  total_tokens_used: number;
  created_at: string;
  updated_at: string;
  steps: AgentStep[];
}
