import { MediaAsset, ScormProject } from '../types/scorm';
import { generateFallbackPackage } from '../skills/scormSkillTemplate';

export interface SampleCourseTemplate {
  id: string;
  courseTitle: string;
  courseSlug: string;
  moduleBadge: string;
  lessonTitle: string;
  category: string;
  description: string;
  lessonContent: string;
  mediaAssets: MediaAsset[];
}

export const SAMPLE_COURSES: SampleCourseTemplate[] = [
  {
    id: 'sample-zero-trust',
    courseTitle: 'Enterprise Cloud Security & Defense',
    courseSlug: 'enterprise_cloud_security',
    moduleBadge: 'Module 3 • Zero Trust',
    lessonTitle: 'Micro-Segmentation & Identity Guardrails',
    category: 'Cybersecurity',
    description: 'Master zero-trust principles, least-privilege telemetry, and perimeter-less access control protocols.',
    lessonContent: `# Micro-Segmentation & Identity Guardrails

Zero Trust represents a fundamental paradigm shift in enterprise infrastructure defense: never trust, always verify. Under legacy perimeter models, perimeter firewalls created a brittle moat-and-castle topology where any compromised internal node yielded unrestricted lateral movement across enterprise subnets.

In contemporary distributed environments, identity is the true perimeter. Every transaction, RPC call, and telemetry packet must be authenticated, authorized, and cryptographically verified regardless of physical network locality.

Key Architectural Pillars:
1. Explicit Verification: Continuously authenticate and authorize based on all available data points including user identity, device posture, location, data classification, and anomalous behavioral spikes.
2. Principle of Least Privilege: Restrict access with Just-In-Time (JIT) and Just-Enough-Access (JEA) risk-adaptive policies and automated token expiration.
3. Assume Breach: Minimize blast radiuses by segmenting access by network, user, devices, and application awareness. Encrypt all sessions end-to-end and utilize automated threat detection.

Operational Implementation Protocols:
Implementing zero trust requires phased telemetry collection rather than immediate monolithic policy enforcement. Organizations must first baseline normal network traffic between microservices, map data dependency graphs, and identify high-value data repositories. Only once ingress and egress dependencies are documented should strict enforcement firewalls be enabled.

High-consequence decisions emerge when balancing security controls against developer velocity. Restricting service account tokens to single-hour TTLs prevents lateral movement, but requires resilient automated renewal pipelines to avoid accidental production disruption.`,
    mediaAssets: [
      {
        id: 'media-1',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        caption: 'Figure 1: Zero Trust Continuous Policy Decision Point (PDP) Architecture',
        targetScreen: 3,
      },
    ],
  },
  {
    id: 'sample-crisis-brand',
    courseTitle: 'Executive Leadership & Governance',
    courseSlug: 'executive_leadership',
    moduleBadge: 'Module 2 • Crisis Comms',
    lessonTitle: 'Brand Equity Triage Under High Uncertainty',
    category: 'Leadership & Strategy',
    description: 'Learn executive decision-making frameworks to protect brand reputation and shareholder trust in volatile incidents.',
    lessonContent: `# Brand Equity Triage Under High Uncertainty

In crisis scenarios, corporate communications and operational remediation operate under severe time compression and incomplete intelligence. The traditional instinct of corporate legal teams—to withhold comment until exhaustive facts are confirmed—frequently detonates brand equity in digital channels.

Silence in an information vacuum is universally interpreted as guilt or managerial incompetence. Executive teams must master the "Holding Statement Doctrine": acknowledging the anomaly immediately, transparently stating what is known and what remains unverified, and establishing a predictable cadence for public telemetry.

Core Decision Matrix:
1. Transparency Velocity: Disclose factual updates before external journalists or regulatory auditors leak speculative fragments.
2. Empathy Alignment: Address stakeholder impact and consumer protection prior to financial impact or share price stabilization.
3. Root Cause Commitment: Commission independent verification panels to review architectural vulnerabilities.

Balancing Short-Term Metrics vs Long-Term Equity:
When market pressures urge quick closure, rushing an incomplete post-mortem breeds long-term distrust. True corporate resilience demands that executive leadership prioritize systemic integrity over quarterly optics.`,
    mediaAssets: [
      {
        id: 'media-2',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        caption: 'Figure 2: Brand Equity Valuation vs Incident Transparency Trajectory',
        targetScreen: 3,
      },
    ],
  },
  {
    id: 'sample-fintech-aml',
    courseTitle: 'Global Fintech Compliance & Regulatory Protocols',
    courseSlug: 'fintech_compliance_aml',
    moduleBadge: 'Module 4 • Financial Crime',
    lessonTitle: 'Anti-Money Laundering & Synthetic Identity Triage',
    category: 'Compliance & Risk',
    description: 'Hands-on triage of transaction monitoring alerts, structuring indicators, and SAR regulatory filings.',
    lessonContent: `# Anti-Money Laundering & Synthetic Identity Triage

Financial crime compliance requires transaction monitoring systems capable of differentiating legitimate liquidity volatility from sophisticated money laundering topologies. Regulatory bodies worldwide impose strict penalties on financial institutions that fail to maintain adequate suspicious activity reporting mechanisms.

Modern financial crime syndicates leverage synthetic identities—combining stolen legitimate identifiers with fictitious persona profiles—to age credit profiles before executing rapid cross-border bust-out schemes.

Analytical Protocol Requirements:
1. Structuring Detection: Identify transaction sequences deliberately calibrated below statutory reporting thresholds ($10,000 USD).
2. Velocity Anomaly Tracking: Detect abrupt accelerations in peer-to-peer transfers followed by rapid liquidation into privacy currencies or high-risk offshore jurisdictions.
3. Beneficial Ownership Verification: Enforce exhaustive multi-layer corporate registry audits to expose ultimate beneficial owners.

Regulatory Suspicious Activity Reporting (SAR):
When automated heuristics flag an account, compliance officers have a strict 30-day statutory window to evaluate evidence and submit a confidential SAR. Investigators must balance avoiding "defensive filing" against the criminal liabilities of failing to escalate substantiated fraud.`,
    mediaAssets: [
      {
        id: 'media-3',
        url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
        caption: 'Figure 3: Synthetic Identity Detection Topology & Velocity Anomaly Clustering',
        targetScreen: 3,
      },
    ],
  },
];

export function createProjectFromTemplate(template: SampleCourseTemplate): ScormProject {
  const settings = {
    scormVersion: '1.2' as const,
    layout: 'no-scroll' as const,
    targetScreens: 6,
    gamification: true,
    selectedPatterns: ['decision-simulator' as const, 'pill-classifier' as const],
    lightbox: true,
    customInstructions: 'Executive dark slate tone, WCAG AA contrast, clear instructional hierarchy.',
    theme: 'slate-dark' as const,
  };

  const files = generateFallbackPackage({
    courseTitle: template.courseTitle,
    moduleBadge: template.moduleBadge,
    lessonTitle: template.lessonTitle,
    lessonContent: template.lessonContent,
    mediaAssets: template.mediaAssets,
    settings,
  });

  return {
    id: 'proj-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    courseTitle: template.courseTitle,
    courseSlug: template.courseSlug,
    moduleBadge: template.moduleBadge,
    lessonTitle: template.lessonTitle,
    lessonContent: template.lessonContent,
    mediaAssets: template.mediaAssets,
    settings,
    files,
    status: 'generated',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
