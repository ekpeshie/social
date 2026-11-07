// Ready-made UX/UI post drafts used when no ANTHROPIC_API_KEY is set.
// They aren't tied to the news; edit them freely and add your own.
// Bracketed text like [your project] is a placeholder for your own details.

export type BankIdea = {
  topic: string
  angle: string
  whyNow: string
  linkedin: string
  x: string[]
}

export const ideaBank: BankIdea[] = [
  {
    topic: "Design systems start with an audit",
    angle: "Before building components, count what already exists.",
    whyNow: "Most teams start a design system by drawing, not by counting.",
    linkedin: `The first step of a design system isn't Figma. It's a screenshot folder.

On [your project], before designing a single component, I screenshotted every button in the product.

We had 23 button styles. Nobody had decided on 23. They just happened, one deadline at a time.

That one slide did more to get buy-in than any proposal I could have written. Engineers saw the CSS they were maintaining. PMs saw why screens felt "off" without being able to say why.

How to run a quick UI audit:
1. Pick one component type (buttons, inputs or colors).
2. Screenshot every instance across the product.
3. Group the near-duplicates.
4. Put the count on one slide.

Start with the component that has the most variants. That's your first win.

What's the most duplicated component in your product?

#DesignSystems #UXDesign`,
    x: [
      "Before building a design system, audit what exists.\n\nI screenshotted every button in [your project]: 23 styles. Nobody chose 23. They piled up one deadline at a time.\n\nThat one slide got more buy-in than any proposal.",
    ],
  },
  {
    topic: "Five-user usability tests",
    angle: "You don't need a research budget to find your worst usability problems.",
    whyNow: "Teams skip testing because they think it has to be big.",
    linkedin: `"We don't have budget for research" usually means "we think research has to be big."

It doesn't. Five people and one afternoon will find most of your worst usability problems.

Here's the setup I use:
→ Recruit 5 people who match your user (friends of friends count).
→ Give each one a single task: "Sign up and create your first [thing]."
→ Share your screen or a prototype on a call.
→ Say almost nothing. Write down where they hesitate.

By the third session you'll hear the same confusion twice. By the fifth you'll know what to fix first.

It isn't statistically perfect. It doesn't need to be. It needs to be better than guessing.

What's stopping your team from testing this week?

#UXResearch #ProductDesign`,
    x: [
      "\"No budget for research\" usually means \"we think research has to be big.\"\n\n5 users, 1 task each, 1 afternoon. You'll find most of your worst usability problems by session 3.",
      "The setup:\n1. Recruit 5 people who match your user\n2. One task: \"Sign up and create your first [thing]\"\n3. Watch. Say almost nothing.\n4. Note every hesitation.",
      "It's not statistically perfect. It just has to beat guessing, and it does.",
    ],
  },
  {
    topic: "Contrast is the easiest accessibility win",
    angle: "Most accessibility failures are color contrast, and they're the cheapest to fix.",
    whyNow: "Low-contrast grey text is still everywhere.",
    linkedin: `Light grey text on white looks elegant in a Dribbble shot. In real life it fails a lot of people.

Low contrast text is the single most common accessibility failure on home pages, every year it's measured. It's also the cheapest one to fix.

The rule: body text needs a contrast ratio of at least 4.5:1 against its background. Large text (24px+, or 19px bold) needs 3:1.

What I do on every project now:
1. Check every text color token against every background it sits on.
2. Fix it in the tokens, not screen by screen.
3. Add the ratio to the token's documentation so nobody "lightens it a bit" later.

This takes an hour. It helps people with low vision, people on cheap screens, and everyone reading their phone outside.

When did you last check your secondary text color?

#Accessibility #UIDesign`,
    x: [
      "Light grey text on white is the most common accessibility failure on the web, and the cheapest to fix.\n\nBody text: 4.5:1 contrast minimum. Large text: 3:1.\n\nFix it once in your color tokens, not screen by screen.",
    ],
  },
  {
    topic: "Write the error message first",
    angle: "Designing the unhappy path early makes the whole flow better.",
    whyNow: "Error states are usually designed last, in a hurry.",
    linkedin: `I've started designing error states before the happy path.

It sounds backwards. But when I write "Your card was declined. Try another card or contact your bank." before I draw the checkout, I find out what the flow actually needs:
→ Where does the message go?
→ Is the user's input kept?
→ What's the next action?

Designing errors last means they get squeezed into whatever space is left. That's how you end up with "Something went wrong."

A good error message answers three questions:
1. What happened?
2. Why (if it helps)?
3. What can I do now?

Next time you start a flow, list every way it can fail first. You'll design a better happy path too.

#UXWriting #ProductDesign`,
    x: [
      "I design error states before the happy path now.\n\nWriting \"Your card was declined. Try another card or contact your bank.\" first tells you what the flow needs: where messages go, what input is kept, what the next action is.",
      "A good error message answers 3 questions:\n1. What happened?\n2. Why (if it helps)?\n3. What can I do now?\n\n\"Something went wrong\" answers none.",
    ],
  },
  {
    topic: "Portfolios: show the decision, not the deliverable",
    angle: "Hiring managers want to see how you think, not 40 polished screens.",
    whyNow: "Many designer portfolios are galleries with no reasoning.",
    linkedin: `Most design portfolios I review are galleries. Beautiful screens, no reasoning.

Hiring managers spend a couple of minutes per portfolio. In that time they're looking for one thing: how you make decisions.

A case study structure that works:
1. The problem, in one sentence, with a number if you have one.
2. Your role. Be specific: "I led research and the redesign of onboarding."
3. Two or three key decisions, each with the options you considered and why you chose one.
4. What happened after launch. Even "we didn't get data, here's what I'd measure" is fine.

Cut the 40 screens down to the 5 that show those decisions.

One strong case study beats four weak ones.

Designers: what's the hardest part of writing case studies for you?

#UXPortfolio #DesignCareers`,
    x: [
      "Most design portfolios are galleries: beautiful screens, no reasoning.\n\nHiring managers want to see how you make decisions. Show the 2-3 key choices, the options you rejected, and why.\n\nOne strong case study beats four weak ones.",
    ],
  },
  {
    topic: "AI tools speed up the middle, not the start",
    angle: "AI is great for exploring variations, weak at deciding what problem to solve.",
    whyNow: "Every design tool now ships AI features.",
    linkedin: `I've used AI tools in my design work for a while now. Here's where they actually help, and where they don't.

Where they help:
→ Generating 10 layout variations to react to
→ Writing first-draft microcopy I then edit
→ Turning messy research notes into themes to check
→ Filling realistic placeholder content

Where they don't:
→ Deciding which problem is worth solving
→ Knowing your users' context
→ Making the trade-off between business goals and user needs

AI makes the middle of the process faster. The start (framing the problem) and the end (judging what's good) are still the job.

That's good news for designers who are strong at both.

How are you using AI in your workflow?

#AIinDesign #UXDesign`,
    x: [
      "AI tools speed up the middle of design work: variations, first-draft copy, sorting research notes.\n\nThey don't decide which problem matters or judge what's good. That's still the job.",
    ],
  },
  {
    topic: "Name tokens by role, not by color",
    angle: "Semantic token names survive rebrands and dark mode.",
    whyNow: "Teams adding dark mode often find their tokens can't support it.",
    linkedin: `If your color tokens are named "blue-500" and "grey-100", dark mode is going to hurt.

Name tokens by what they do, not what they look like:
→ background, foreground
→ muted-foreground for secondary text
→ primary for the main action
→ destructive for danger
→ border, input, ring for focus

Then each name gets a light value and a dark value. Components only ever use the role names.

When we did this on [your project], dark mode went from "a quarter of work" to "a week of picking values." A rebrand became a change to one file.

If you're starting a design system, this is the decision to get right early.

#DesignSystems #DesignTokens`,
    x: [
      "Name color tokens by role, not by color.\n\n\"blue-500\" breaks in dark mode. \"primary\", \"muted-foreground\" and \"border\" just get a second value.\n\nComponents use roles. Themes become one file.",
    ],
  },
  {
    topic: "Touch targets: 44px isn't a suggestion",
    angle: "Small tap targets are a top source of mobile frustration.",
    whyNow: "Dense desktop-first designs often ship to mobile unchanged.",
    linkedin: `If your users keep tapping the wrong thing, the problem might be 12 pixels.

Apple recommends tap targets of at least 44×44 points. Material Design uses 48dp. WCAG 2.2 sets a minimum of 24×24 CSS pixels.

The icon can be small. The tappable area can't.

Quick checks I run on every mobile design:
1. Icon buttons have padding that brings the target to 44px.
2. Links in body text have enough line height to tap without hitting the line above.
3. Close buttons aren't tucked into the corner of a modal.

It's one of the cheapest ways to make an app feel easier to use.

#MobileUX #Accessibility`,
    x: [
      "Users tapping the wrong thing? Check your tap targets.\n\nApple: 44×44pt. Material: 48dp. WCAG 2.2 minimum: 24×24px.\n\nThe icon can be small. The tappable area can't.",
    ],
  },
  {
    topic: "Empty states are onboarding",
    angle: "The first screen a new user sees is usually empty, so design it.",
    whyNow: "Empty states are often left as a blank page with 'No data'.",
    linkedin: `The first screen most new users see in your product is empty.

No projects. No messages. No data. And often just two words: "No items."

That empty screen is your onboarding. A good one does three things:
1. Says what will appear here: "Your invoices will show up here."
2. Gives one clear action: "Create your first invoice."
3. Optionally shows an example, clearly marked as one.

On [your project], [describe a change you made to an empty state and what happened].

Go open your product with a fresh account today. What does the first screen say?

#ProductDesign #Onboarding`,
    x: [
      "The first screen most new users see is empty.\n\nA good empty state:\n1. Says what will appear here\n2. Gives one clear action\n3. Maybe shows an example, marked as one\n\n\"No items\" does none of that.",
    ],
  },
  {
    topic: "Handoff is a conversation, not a file",
    angle: "Fewer design-dev surprises come from talking early, not better specs.",
    whyNow: "Design-to-dev handoff is still a top source of rework.",
    linkedin: `The best design handoff I've done wasn't a file. It was a 20-minute call before I started designing.

I asked the engineer:
→ What's hard to build in this area?
→ What components do we already have?
→ What data might be missing or slow?

Those answers changed my design before it was a design. No rework later.

Specs still matter: states, spacing tokens, edge cases like long names and empty lists. But a spec can't fix a design that ignored how the system works.

Talk first. Spec second.

How does handoff work on your team?

#DesignHandoff #ProductDesign`,
    x: [
      "My best design handoff wasn't a file. It was a 20-minute call before I started.\n\n\"What's hard to build here? What components exist? What data might be missing?\"\n\nTalk first, spec second.",
    ],
  },
  {
    topic: "One primary button per screen",
    angle: "When everything is emphasized, nothing is.",
    whyNow: "Screens with three competing primary buttons are common.",
    linkedin: `If a screen has three primary buttons, it has zero.

The primary button answers one question for the user: "What should I do next?" When three buttons all shout, the user has to work it out themselves.

My rule:
→ One primary action per view
→ Secondary or outline buttons for alternatives
→ Ghost or link buttons for low-priority actions
→ Destructive actions separated and confirmed

It's a simple rule that forces a product decision: what is this screen for?

That conversation with your PM is often more valuable than the button itself.

#UIDesign #UXDesign`,
    x: [
      "If a screen has three primary buttons, it has zero.\n\nOne primary action per view. Outline for alternatives. Ghost for low priority.\n\nThe rule forces the real question: what is this screen for?",
    ],
  },
  {
    topic: "Design reviews: critique the goal, not the taste",
    angle: "Tie every piece of feedback to the user goal to keep reviews useful.",
    whyNow: "Design reviews often drift into personal preference.",
    linkedin: `"I don't love the blue" isn't design feedback. It's a preference.

The design reviews that help me most follow one rule: every comment connects to the goal.

Instead of: "This feels cluttered."
Try: "The goal is to get people to finish setup. I'm not sure where to look first."

A simple structure to open a review:
1. State the goal of the design in one sentence.
2. Say what kind of feedback you want: flow, copy, or visual.
3. Ask reviewers to tie comments to the goal.

You'll get fewer opinions and more insight.

#DesignCritique #UXDesign`,
    x: [
      "\"I don't love the blue\" is a preference, not feedback.\n\nOpen every design review by stating the goal in one sentence, and ask people to tie comments to it.\n\nFewer opinions, more insight.",
    ],
  },
]
