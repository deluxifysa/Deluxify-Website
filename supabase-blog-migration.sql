-- ─── Blog Posts Table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT        NOT NULL,
  slug          TEXT        UNIQUE NOT NULL,
  excerpt       TEXT,
  content       TEXT        NOT NULL DEFAULT '',
  cover_image   TEXT,
  author_name   TEXT        NOT NULL DEFAULT 'Deluxify Team',
  category      TEXT        NOT NULL DEFAULT 'AI Insights',
  tags          TEXT[],
  reading_time  INT         DEFAULT 5,
  status        TEXT        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'published', 'archived')),
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_blog_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authenticated) can read published posts
CREATE POLICY "Published posts are publicly readable"
  ON blog_posts FOR SELECT
  USING (status = 'published');

-- Authenticated staff can read ALL posts (including drafts)
CREATE POLICY "Staff can read all posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated staff can insert, update, delete
CREATE POLICY "Staff can insert posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Staff can delete posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (true);

-- ─── Seed: 3 Recent AI News Articles ─────────────────────────────────────────
INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author_name, category, tags, reading_time, status, published_at)
VALUES

(
  'The Rise of Agentic AI: How Autonomous Agents Are Reshaping Enterprise Workflows',
  'rise-of-agentic-ai-reshaping-enterprise-workflows',
  'Autonomous AI agents are no longer a future concept — they are actively reshaping how companies operate, from automated customer support to intelligent multi-step workflow orchestration.',
  'Artificial intelligence has crossed a significant threshold. What was once considered futuristic — AI systems that can plan, reason, and take actions autonomously — is now powering real enterprise workflows across the globe. The era of agentic AI has arrived, and its impact on business operations is profound.

Unlike traditional AI models that respond to single prompts, AI agents are designed to pursue goals across multi-step processes. They can use tools, search the web, write and execute code, interact with APIs, and even spawn sub-agents to handle parallel tasks. Companies like Anthropic, OpenAI, and Google have made significant strides in making these agents more reliable and capable of handling real-world complexity.

The business applications are vast. In customer service, AI agents handle complex queries end-to-end without human intervention. In finance, they process invoices, reconcile accounts, and flag anomalies in real time. In marketing, they research competitors, draft campaigns, and schedule content across channels — all from a single high-level instruction.

For South African businesses, the opportunity is particularly compelling. Labour costs and administrative overhead represent a significant portion of operational expenses. AI agents can automate repetitive knowledge work — data entry, report generation, email triage — freeing your team to focus on high-value client relationships and strategic thinking.

However, deploying AI agents requires careful architecture. Trust boundaries, human oversight mechanisms, and clear escalation paths are essential. At Deluxify, we design agent systems with built-in checkpoints — ensuring that automation enhances rather than replaces human judgment at critical decision points.

The companies that will lead the next decade are those investing in AI agent infrastructure today. Not as a replacement for people, but as a force multiplier that allows small, elite teams to deliver at the scale of much larger organisations. If you are ready to explore what AI agents can do for your business, the time to start is now.',
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&auto=format&fit=crop&q=80',
  'Deluxify Team',
  'AI Insights',
  ARRAY['AI Agents', 'Automation', 'Enterprise', 'Workflows'],
  7,
  'published',
  NOW() - INTERVAL '8 days'
),

(
  'Multimodal AI in 2025: Beyond Text — Vision, Voice, and Document Understanding for Business',
  'multimodal-ai-2025-vision-voice-document-understanding',
  'Leading AI models now process images, PDFs, audio, and video alongside text — unlocking entirely new workflows in legal, finance, logistics, and beyond. Here is what it means for your business.',
  'For most of the past decade, AI''s impact on business was primarily through text. Chatbots answered questions, language models drafted emails, and NLP tools extracted insights from documents. But 2025 marks a decisive shift: multimodal AI — systems that can see, hear, and reason across multiple data types simultaneously — is moving from research labs to production environments.

Leading models now process images, PDFs, audio, video, and structured data alongside natural language. This is not just about novelty — it unlocks entirely new use cases. An AI system can now review a scanned contract, extract key clauses, cross-reference pricing tables, and draft a negotiation memo — all in a single automated workflow, without any human touching the document.

For document-heavy industries — legal, finance, insurance, logistics — the implications are transformative. Multimodal AI can process hundreds of pages of supplier invoices, identify discrepancies, and flag items for human review in seconds. Manual document processing that once took days now happens in minutes, with greater accuracy and full audit trails.

In product businesses, vision-capable AI agents are being used for quality control, inventory management, and visual search. A retail company can upload images of stock levels and receive automated reorder recommendations. A manufacturing plant can flag defects from camera feeds without writing a single line of custom computer vision code.

Voice and audio understanding is equally powerful for service businesses. AI agents that transcribe, summarise, and analyse client calls can automatically update CRM records, identify sentiment trends, and surface coaching opportunities for sales teams — removing hours of manual note-taking from every customer conversation.

At Deluxify, we help businesses identify which data modalities are most relevant to their specific workflows and design AI systems that bridge the gap between unstructured data and actionable decisions. The question is no longer whether AI can handle your data types — it is whether your business is positioned to capture the value.',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
  'Deluxify Team',
  'AI News',
  ARRAY['Multimodal AI', 'Vision AI', 'Document Processing', 'Business'],
  6,
  'published',
  NOW() - INTERVAL '16 days'
),

(
  'From Prompt Engineering to Agent Engineering: The Shift Every Business Needs to Understand',
  'prompt-engineering-to-agent-engineering',
  'Prompt engineering unlocked significant productivity gains — but it has a ceiling. The next frontier is agent engineering: designing AI systems that pursue goals autonomously, across multiple steps, with memory and tools.',
  'Two years ago, prompt engineering was the skill everyone wanted to master. Craft the right instruction, and a large language model would return the right output. It was a breakthrough that unlocked significant productivity gains — but it has a ceiling. Prompts are single-shot interactions. Agents are systems.

Agent engineering is the discipline of designing AI systems that pursue goals over time, across multiple steps and tools, with appropriate reasoning, memory, and error recovery. It is the difference between asking an AI to draft a proposal and having an AI gather client context, analyse requirements, generate a customised document, and route it for review — without being prompted at each step.

The shift requires thinking in processes, not prompts. Instead of asking what is the best way to phrase this question, agent engineers ask: what are the steps in this workflow, what tools are needed at each step, where do failures occur, and when should a human be involved? It is closer to software architecture than copywriting, and it requires a fundamentally different mindset.

For businesses, this distinction is critical. Prompt-optimised workflows break when context changes. Agent-based systems are designed to adapt. When a data source is unavailable, an agent can try an alternative. When a result is ambiguous, it can ask for clarification. This resilience is what makes agents suitable for production — not just experimentation.

Building production-grade AI agents requires expertise in LLM orchestration, tool design, state management, and safety guardrails. It also requires deep knowledge of the specific business domain — because an agent that automates the wrong workflow, or one that lacks appropriate human oversight, creates more problems than it solves.

Deluxify specialises in moving clients from isolated AI experiments to integrated agent systems that deliver measurable business value. Whether you are looking to automate client onboarding, streamline reporting, or build an intelligent operations assistant, the foundation is the same: thoughtful agent design rooted in real operational understanding. Let us build yours.',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
  'Deluxify Team',
  'Industry Trends',
  ARRAY['Prompt Engineering', 'AI Agents', 'Strategy', 'LLMs'],
  5,
  'published',
  NOW() - INTERVAL '24 days'
);
