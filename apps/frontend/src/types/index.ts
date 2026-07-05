export interface Portfolio {
  total_value: number;
  day_change: number;
  day_change_pct: number;
  total_pnl: number;
  holdings_count: number;
  top_gainers: Holding[];
  top_losers: Holding[];
}

export interface Holding {
  symbol: string;
  name?: string;
  change_pct: number;
  value: number;
  quantity?: number;
  avg_price?: number;
  current_price?: number;
  pnl?: number;
  allocation?: number;
}

export interface RiskMetrics {
  overall_score: number;
  risk_level: string;
  sharpe_ratio: number;
  max_drawdown: number;
  var_95: number;
  diversification_score: number;
}

export interface Goal {
  name: string;
  progress: number;
  on_track: boolean;
  target: number;
  current?: number;
  monthly_contribution?: number;
  target_date?: string;
}

export interface GoalWidget {
  goals_on_track: number;
  goals_total: number;
  total_target: number;
  total_current: number;
  overall_progress_pct: number;
  goals: Goal[];
}

export interface MarketIndex {
  name: string;
  value: number;
  change_pct: number;
}

export interface MarketWidget {
  indices: MarketIndex[];
  top_gainers: Holding[];
  top_losers: Holding[];
  market_status: string;
  last_updated: string;
}

export interface DigitalTwinWidget {
  financial_health_score: number;
  projected_net_worth: number;
  savings_rate: number;
  risk_alignment: string;
  recommendations: string[];
}

export interface AIInsight {
  type: string;
  summary: string;
  confidence: number;
  timestamp: string;
}

export interface AIInsightsWidget {
  recent_insights: AIInsight[];
  insight_count: number;
  confidence_avg: number;
}

export interface ComplianceWidget {
  overall_compliant: boolean;
  regulations_checked: number;
  violations_count: number;
  critical_violations: number;
  last_check: string | null;
}

export interface Notification {
  type: string;
  message: string;
  time: string;
}

export interface NotificationsWidget {
  unread_count: number;
  alerts: Notification[];
}

export interface Dashboard {
  user_id: number;
  portfolio: Portfolio;
  risk: RiskMetrics;
  goals: GoalWidget;
  market: MarketWidget;
  digital_twin: DigitalTwinWidget;
  ai_insights: AIInsightsWidget;
  compliance: ComplianceWidget;
  notifications: NotificationsWidget;
  generated_at: string;
}

export interface CopilotCard {
  card_type: string;
  title: string;
  data: any;
  confidence?: number;
}

export interface CopilotSource {
  module: string;
  endpoint: string;
  description: string;
}

export interface CopilotResponse {
  answer: string;
  reasoning: string;
  sources: CopilotSource[];
  cards: CopilotCard[];
  assumptions: string[];
  limitations: string[];
  confidence: number;
  disclaimer: string;
  timestamp: string;
}

export interface ScenarioResult {
  scenario_name: string;
  scenario_type: string;
  projected_net_worth: number;
  projected_monthly_savings: number;
  projected_portfolio_value: number;
  inflation_adjusted_value: number;
  goal_achievement_probability: number;
  yearly_projections: YearlyProjection[];
  monte_carlo?: MonteCarloResult;
  risk_metrics?: any;
  disclaimer?: any;
}

export interface YearlyProjection {
  year: number;
  net_worth: number;
  portfolio_value: number;
  monthly_savings: number;
  cumulative_investment: number;
  confidence?: {
    lower_5: number;
    lower_25: number;
    median: number;
    upper_75: number;
    upper_95: number;
  };
}

export interface MonteCarloResult {
  iterations: number;
  median_portfolio: number;
  confidence_interval: {
    lower_5: number;
    lower_25: number;
    median: number;
    upper_75: number;
    upper_95: number;
  };
  probability_of_loss: number;
  expected_annual_return: number;
  percentile_5: number;
  percentile_95: number;
}

export interface ScenarioType {
  type: string;
  name: string;
}
