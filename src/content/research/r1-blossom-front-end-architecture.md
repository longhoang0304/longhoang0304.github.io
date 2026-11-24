---
postId: r1
postSlug: blossom-front-end-architecture
title: "Blossom: a front-end architecture"
publishedDateTime: 2026-11-24T12:00:00Z
draft: false
type: paper
abstract: "Front-end code tends to lose its shape as requirements pile up: rules spread through components, products branch on if-else, and it gets harder to say where a change should go. Blossom gives each kind of code one place: a UI in six layers that only draws, a business layer of plain functions that holds the rules, and repos that reach the data, with data flowing one way between them. Its rules have names, and a plain test enforces the structural ones. This paper describes the design, builds one page three ways, and discusses what the structure gives a team, what it costs, and how it scales down."
description: Layers for the UI, plain functions for the business, one direction of flow, and a test that keeps it all in place.
tags:
  - frontend
  - architecture
---

## Introduction

This started as an RFC I wrote at work. We had a front-end that kept growing, and every new requirement made it a little harder to say where a change should go. I wanted one place for each kind of thing: one for the look, one for the rules, one for the data, and a clear line between them.

Two products were built on the same front-end code. Switching between them took if-else branches on the product all through the code. Each new difference added more branches, the two products' code tangled together, and a change made for one product could break the other.

The result is **Blossom**. It separates the UI from the business logic, layers the UI, says where each kind of state lives, keeps styles consistent, and checks all of it with a test.

Blossom puts a clear boundary between products while sharing as much as possible. Each kind of difference has one place to live, and code outside that place never asks which product it is in.

| Difference | Where it lives | What every product shares |
| --- | --- | --- |
| How it looks: colors, radius, logo | the product's theme files and product-named assets | every element, component, domain component, view and page, and their stylesheets |
| What a page shows | the page's view model, built from what the business works out | the views and components that draw it |
| What a user can do, and the rules behind it | the features and flows the controller runs | the UI, which only calls `actions` |

Elements and components know nothing about the business, and no part of the UI knows which product it is in, so every product uses the whole UI as it is. A new product starts with two theme files. A new difference goes into one of the places above, not into another if-else.

Even if you only ever ship one product, the same split pays off: it is what makes the rest of this post work.

**What this paper covers.**

- The structure: a UI in six layers, a business layer of plain functions, and a data layer behind repos, with data flowing one way between them (sections 2 and 3).
- A set of named rules, and a plain test that enforces the structural ones (section 3.7).
- One page built three ways, with the same change then made to each (section 4).
- What the structure gives a team, what it costs, how it scales down to a small project, and this site as a live example (section 5).
- Every rule in one place, reference tables and code, and a sample `CLAUDE.md` (appendices A and B).

This is a trimmed version of that RFC. The examples here use a small task list instead of the app I built it for, and the code is SolidJS with TypeScript, but none of the rules depend on either.

It's an experience report from one team and one codebase, not a study. What follows is what worked for us, with the reasons written down, so you can judge whether they hold for your project.

### Why "Blossom"

A page is built like a flower: one blossom made of petals, each petal made of smaller parts, all fed by the same plant.

| The plant | Blossom |
| --- | --- |
| The flower | a page |
| Petals | views |
| Veins, carrying the sap into each petal | smart views |
| The parts each petal is made of | domain components |
| Stems, and the cells every plant is built from | components and elements |
| The sap, flowing through the whole plant | the business: the controller, view models and features |
| Roots, drawing from the soil | repos and storage, drawing from the server and the browser |
| The variety's colors | the themes, one per product |

The sap rises one way, from the roots to the petals, as data does from the repos to the screen. Nothing flows back down but what the user asks for, through `Actions`.

## Blossom at a glance

Figure 1 shows the whole architecture on one screen. The rest of the paper is the detail.

<figure>
  <a class="figure-light" href="/blog-assets/r1/r1-figure-1-light.svg">
    <img src="/blog-assets/r1/r1-figure-1-light.svg" alt="Three bands stacked top to bottom. UI: pages, smart views, views, domain components, components and elements. Business: controller, features and flows, view models and the model store. Data: repos, storage, and the server and browser. Actions go down from the UI to the business, view models come back up, and the business reads and writes data through repos. Models and shared code sit below everything." width="1096" height="929" loading="lazy" />
  </a>
  <a class="figure-dark" href="/blog-assets/r1/r1-figure-1-dark.svg">
    <img src="/blog-assets/r1/r1-figure-1-dark.svg" alt="Three bands stacked top to bottom. UI: pages, smart views, views, domain components, components and elements. Business: controller, features and flows, view models and the model store. Data: repos, storage, and the server and browser. Actions go down from the UI to the business, view models come back up, and the business reads and writes data through repos. Models and shared code sit below everything." width="1096" height="929" loading="lazy" />
  </a>
  <figcaption><strong>Figure 1.</strong> Blossom at a glance. What the user asks for goes down as actions; the business turns it into view models that come back up to the screen. Only the data layer reaches the outside.</figcaption>
</figure>

Data moves one way. An action goes down to the controller, the controller runs features that read and write through repos, and the result comes back up to the screen as view models, through the model store. Imports only go downward.

In folders:

```text
src/index.tsx                 the entry: builds the storage and the repos, sets the theme, builds the model store and the controller
src/Shell.tsx                 draws the model store's view, keeps the URL in step, picks the page
src/pages/ … src/elements/    the UI, in six layers
src/controller/               holds the business state, implements Actions, writes the model store
src/view-model/               AppModel and one model per page: what the UI draws
src/features/                 the business logic: one feature per file, and flows
src/repos/                    data access, one repo per kind of data: tasks, comments, preferences…
src/storage/                  the only effects: the HTTP client, local storage, an in-memory cache
src/models/                   types and their own functions, used by features/, repos/ and the UI
src/shared/                   functions that several features, or features and repos/, use
src/themes/                   CSS framework setup, a theme per product and mode
```

**The business has no UI.** `controller/`, `view-model/` and `features/` hold no UI code. The UI depends on them, never the reverse.

**Most of it is plain TypeScript.** Everything except the UI and `storage/` uses no UI framework and no browser globals, so it runs and is tested in Node.

**Rules live in features.** Anything worked out from business data, such as which actions an item allows, counts like "3 tasks due today" or validation messages, is worked out in `features/` and reaches the UI in a view model.

**Data comes through repos.** Everything that leaves the app goes through a repo, one per kind of data. Features take the repos they need as arguments, so their tests pass fakes.

The rules have names, so a code review can say "this breaks UI-5" instead of arguing it again. The ones that matter most:

| Rule | In one line |
| --- | --- |
| UI-1 | Imports go downward only, never up. |
| UI-4 | Elements and components know nothing about the business. |
| UI-5 | Only pages and smart views call `actions`. |
| UI-6 | Only elements and components draw controls and own the look; the layers above only lay out. |
| BIZ-1 | One feature per file: a plain function, with its test beside it. |
| BIZ-6 | The controller holds the state; business rules live in features. |
| BIZ-7 | A big change that others rely on gets a new piece beside the old one, not an if-else. |
| REPO-4 | Features reach outside data only through repos; only storage has effects. |
| STYLE-6 | Every color comes from a theme. |

## Design

This section describes each part in turn, from the screen down to the data, then the styling and the test that holds it all together.

### The UI layers

Six layers. A page splits into views, its sub-problems; a big view splits into domain components, the pieces of its solution; and all of them are built from components and elements, the only two layers that draw controls and own the look.

| Layer | Folder | Solves | Examples | Knows the business? |
| --- | --- | --- | --- | --- |
| **Page** | `pages/` | one page of the app | task list, task, settings, log in | yes |
| **Smart view** | `smart-views/` | a view's logic: wires it to the business | task table, task form, sidebar | yes |
| **View** (dumb) | `views/` | one sub-problem of a page, as a region of it | task header, activity timeline, attachments, task table | reads view models; never calls `actions` |
| **Domain component** | `domain-components/` | a piece of a solution that views are built from | due-date card, assignee picker, status badge, task form | reads view models; never calls `actions` |
| **Component** | `components/` | a UI problem, layouts included | table, pagination, form group, dialog, tabs, filter chips | no |
| **Element** | `elements/` | the smallest piece of UI | text, badge, button, link, row, cell, text input, checkbox | no |

Two parts sit outside the layers. The **shell** draws the model store's view with the controller's actions, keeps UI state that must outlive a page, and picks the page. The **themes** set up the CSS frameworks and hold one theme per product and mode.

#### Views and smart views

A page is one big problem. It splits into sub-problems, its views. A view is one **sub-problem of its page**, and a region of it on screen: the task header, the activity timeline, the sidebar beside them. Take a view off its page and the other views still work; the page only loses that one solution.

A view is always **dumb**. It draws the data it is given and reports its own events through callback props (`onPin(task)`, or `onEvent({ type: 'activated', row })`) without knowing what they mean.

When a view needs logic, that logic goes in its **smart view**, which wraps it, like a container component in React. A smart view is a logic layer, not a visual one: it renders exactly one dumb view and nothing else, with no markup, classes or stylesheet of its own, which is why it has no style prefix. Everything on screen comes from the view it wraps. The smart view turns the view model into the view's data, turns its events into calls on `actions`, and decides when to involve the business: on every keystroke, or only on submit. A view with nothing to wire, such as a page header, has no smart view.

**Why logic only in smart views:** what a view does with the business is in one file, its smart view's `handle`, tested on its own with the fake `Actions`. No component hides a call to the business, so a search for an action lists every place the UI uses it.

**Keeping views dumb maximizes reuse:** another project with the same business problem can take a dumb view as it is and write its own smart view around it.

**The page is where its views meet.** It lays them out, gives each its part of the page's model, and holds the UI state that several of its views share, such as a selection that a list and its detail both show. State that must outlive the page lives in the shell.

#### Domain components

Views stay short by being built from bigger pieces than elements. A **domain component** is a piece of a solution: a group of components and elements that draws one piece of the business, such as a due-date card, an assignee picker or a task form. It solves no problem of its own; a view uses it to solve one. Like every component, it is dumb: data in through props, events out through callbacks.

**View or domain component?** Name it. A problem of the page is a view, however small. A thing that helps solve one is a domain component, however big. Then take it away: if the page loses a whole solution and every other view still works, it was a view; if its view still solves its problem, only less completely, it was a domain component.

#### Where logic goes

| Kind | Examples | Where |
| --- | --- | --- |
| Business rules | which actions a task allows, validation, when a task is overdue | `features/` |
| Wiring | view model → what a view shows; row activated → `actions.tasks.select(id)` | a smart view |
| UI control | selection, scrolling, focus, text being edited, open or closed | a `create…State()` primitive in a `.state.ts` file beside its owner |

#### UI rules

Eight rules keep the UI in shape; Appendix A.1 has them in full. In short: imports only go down and never within a layer, elements and components know nothing about the business, only pages and smart views call `actions`, and only elements and components draw controls and own the look.

#### Why no cross imports

Components that import each other look convenient, but they cost more than they save. **Harder to debug:** a problem in the inner one shows up wherever the outer one is used. **Harder to share:** a component that imports another can't travel alone. **Harder to change:** a props change breaks every piece of its own layer that imports it.

So keep them rare. An element or component may import another of its own layer only when the other is part of it, not content the caller chooses (a select drawing its arrow icon, a date picker opening its calendar), one way and one level only, and recorded with its reason.

#### Native HTML first

Elements and components get their behavior (keyboard, focus, ARIA) from native HTML first: `button`, `select`, `<input type="date">`, `<dialog>`, `<details>` and the `popover` attribute cost nothing to load. For the rest (menus, tabs, a combobox, tooltips), an unstyled component library such as Ark UI, Radix Primitives or React Aria brings the behavior and leaves the look to us. Only elements and components import it.

### The controller, actions and the model store

The UI calls typed actions. The controller runs features with the repos they need and writes view models to the model store, and the screen draws the model store.

```typescript
// controller/actions.ts: one group per business area
export interface Actions {
  nav: { open(route: Route): void; openUrl(url: string): void }
  tasks: { select(id: TaskId): void; pin(task: Task): void; remove(task: Task): void; create(form: TaskForm): void; search(text: string): void }
  prompt: { confirm(): void; cancel(): void }
}

// controller/model-store.ts: where the model lives; the UI framework provides it
export interface ModelStore {
  get(): AppModel
  /** Replaces the model with the one `change` returns. A part that is the same object as before is unchanged. */
  update(change: (model: AppModel) => AppModel): void
}
```

The entry builds the storage, the repos, the model store and the controller, and hands the store's view and the controller's actions to the shell. That is the only place the business is injected: below the shell, props carry it.

```typescript
// src/index.tsx
import './themes/index.css' // first, so the cascade-layer order is declared before any other stylesheet

const url = location.pathname + location.search
const repos = createRepos({ http: createHttpClient(), local: createLocalStore() })
applyTheme(product, repos.preferences.theme()) // sets data-theme before the first render
const store = createSolidModelStore(initialModel(product, url))
const controller = createController({ repos, product, url, store })
render(() => <Shell model={store.view} actions={controller.actions} />, document.getElementById('root')!)
```

#### Why a model store

**The view model is the state; the model store is where it lives.** A view model is a value, and a value can't tell anyone it changed. After each action, the controller builds a new `AppModel`; the model store holds the latest one and tells the UI it was replaced. In a React component, the component owns its state. In Blossom, the controller owns it, because it is business state and the controller is plain TypeScript: it writes to an interface, and the UI framework provides the store behind it.

It is small (an interface of two methods, and a SolidJS version of a few dozen lines), and it earns its place:

- **It keeps the business free of the framework.** The controller's tests run in plain Node, and between SolidJS and React only the store changes.
- **It turns a replaced model into the framework's own way of updating.** With SolidJS it reconciles only the parts that changed; with React it gives a subscription and a snapshot (`useSyncExternalStore`).
- **It gives one writer and one direction.** Only the controller writes it, so "what changed the screen?" has one answer.

Appendix B.2 shows a SolidJS version.

#### The path of one change

```text
input:     element onClick → component onEvent → view onEvent → smart view → actions.tasks.pin(task)
features:  the controller runs a flow or feature → store.update(…) with the new AppModel
store:     the parts that changed are reconciled into the framework's store; the rest is left alone
draw:      only the bindings that read what changed update
```

**Long actions.** Every action returns at once. The controller runs the work as an async function and writes to the model store as each step reports. Each running action has an `AbortController`: a cancel action aborts it, and every repo call takes its signal.

**Props, not context.** Passing models and `actions` as props keeps each layer's inputs in its props type, where review and the layers test can see them. A context would let any layer reach the controller, which UI-5 forbids.

### State, routes and text

Each kind of state has one home: business state in the controller, what the screen draws in the model store, data kept or saved in storage behind a repo, the current page in the model, and UI-only state in the component, page or shell that needs it. Appendix B.1 lists every kind with examples.

**Not used:** data-fetching libraries (such as TanStack Query or SWR) and the framework's resource helpers. They fetch from inside components, which puts server calls in the UI. A query cache with no UI framework in it can still go inside a repo, if cached data shown while refetching is ever needed.

**Text input** stays in UI state until the user submits. The smart view then calls one action with the whole form, and `features/` validates it. Only a feature that needs results while the user types, such as search, gets an action call on each change, debounced by the smart view.

**Routes.** Every page has a URL, and the model, not a router library, decides which page is shown. The route table lives in `models/route.ts` with tests in both directions, the controller holds `model.route` and `model.url`, and the shell keeps the browser's history in step. Links are real `<a href>`s, so opening one in a new tab works, and pages load lazily.

```typescript
// models/route.ts: one variant per page
export type Route =
  | { page: 'tasks' }
  | { page: 'task'; id: TaskId; tab?: 'activity' }
  | { page: 'settings' }
  | { page: 'not-found' }

/** URL patterns, both ways: '/tasks/:id/activity' ↔ { page: 'task', id, tab: 'activity' }. */
export function parseUrl(url: string): Route
export function formatUrl(route: Route): string
```

**Translations** are optional. When a project translates its UI, text is data: the UI holds no text of its own, features pick the locale and load catalogs through a repo, view-model builders turn typed message keys into text, and dates, numbers and plurals are formatted there with the locale. Nothing in the UI picks a language.

### The business layer

By default, business logic is small plain functions, one feature per file. Flows chain them, and the controller runs them and holds the state around them.

```text
src/controller/          holds business state, implements Actions, writes the model store
                         index.ts  actions.ts  model-store.ts  fake.ts
                         nav.ts  tasks.ts  toast.ts     one file per area of Actions
src/view-model/          AppModel, and one model per page: app.ts  tasks.ts  task.ts  …
src/features/
  flows/                 features chained into one action: create-task.ts
  load-tasks.ts          one business feature per file, its test beside it
  pin-task.ts
  validate-task-form/    a big feature: index.ts (runs the rules)  fields.ts  …
```

**The UI meets the business only through `Actions` and view models,** so the business can be built in whatever architecture fits the project: these features and flows, Clean Architecture's use cases, a state machine, or a mix. The rules below are Blossom's default.

Seven rules shape the business layer; Appendix A.2 has them in full. In short: one feature per file, plain functions instead of services, effects kept at the edge, no feature importing another, flows that only chain features, a controller that holds the state while features hold the rules, and a new piece beside the old one instead of a branch.

**Rule or state?** Ask whether it would still hold with nobody watching, in a script or a batch job. If it would, it is a business rule, and goes in a feature. If it exists only because someone is working on a screen (a loading flag, an open dialog, an answer that came too late), it is the controller's state.

#### Models and view models

A **model**, in `models/`, is what the business is about, with no screen in mind: a task, a route, a session, each with its own functions. A **view model**, in `view-model/`, is one page's screen written down as data: its builder reads several models and the controller's state, and shapes them for drawing, so the UI only draws.

| The model: what a task is | The view model: what one row shows |
| --- | --- |
| `dueDate`: a date | `due`: the date as text, formatted for the screen |
| `assignees`: a list of people | `assignees`: one joined string, and `hasAssignees` |
| `status`: a value such as `blocked` | `statusLabel`: the text its badge shows, and `overdue`, worked out from the status and the date |

A new fact about a task goes in `models/`. A new way of showing it goes in the page's view-model builder. A rule the business owns goes in a feature, and the builder only carries its answer to the screen.

### Repos and storage

Features reach outside data only through repos, one per kind of data. Repos read and write through storage, the only place with effects.

```text
src/repos/       tasks-repo.ts  comments-repo.ts  preferences-repo.ts  session-repo.ts  …
                 each with its fake beside it: tasks-repo.fake.ts  …
src/storage/     http-client.ts    the server, over fetch
                 local-store.ts    local storage, as JSON
                 memory-cache.ts   data kept between calls
```

Five rules keep data access in one place; Appendix A.3 has them in full. In short: one repo per kind of data, repos speak models, hold no business rules, are the only thing features take, and sit on storage, the only place with effects.

Repos and the model store are both ports, interfaces whose implementations the entry chooses, but they face opposite ways, so they stay separate. If the model store were a repo, any feature could change the screen directly, and the one-way flow would break.

Fake repos double as a way to run the whole UI on made-up data, without a server, which means the UI can be built before the server is ready.

### Styling

Elements and components own the look; everything above only lays out. Our classes carry their layer's prefix and sit in a cascade layer of the same name, and every color comes from a theme.

The examples use a utility CSS framework with a CSS component library on top (Tailwind CSS with daisyUI), but the rules apply through any equivalent.

| Layer | Stylesheet | Prefix (classes, ids, test ids) | Cascade layer |
| --- | --- | --- | --- |
| Element | `elements/Button/Button.css` | `e-` (`.e-button`) | `ui.elements` |
| Component | `components/Table/Table.css` | `c-` (`.c-table`) | `ui.components` |
| Domain component | `domain-components/TaskForm/TaskForm.css` | `d-` (`.d-task-form`) | `ui.domain-components` |
| View | `views/TaskHeaderView/TaskHeaderView.css` | `v-` (`.v-task-header`) | `ui.views` |
| Page | `pages/TasksPage/TasksPage.css` | `p-` (`.p-tasks`) | `ui.pages` |

#### Why cascade layers

The CSS cascade layers mirror the UI layers, so which style wins follows the architecture, not selector specificity or the order stylesheets load in. A page's layout rule beats a component's default because `ui.pages` comes after `ui.components`, even with a simpler selector: no `!important`, no specificity fights. It is plain CSS, it works in every current major browser, and the developer tools show each rule's layer.

#### Style rules, in short

Seven rules keep the look consistent; Appendix A.4 has them in full. In short: one stylesheet per file that draws, classes prefixed by layer, each control styled once, only layout above components, states as attributes, every color from the theme, and ids that match class names.

#### Themes

Products differ only in their theme files: one file per product and mode, holding only theme variables. The theme is picked at run time by `data-theme="<product>-<mode>"` on `<html>`, set before the first render so the page never flashes in the wrong theme.

```css
/* themes/base.css */
@layer theme, base, components, ui, utilities;
@import "tailwindcss";
@plugin "daisyui" {
  themes: false;
}

@layer ui {
  @layer elements, components, domain-components, views, pages;
}

/* themes/acme.light.css: example values */
@plugin "daisyui/theme" {
  name: "acme-light";
  color-scheme: light;
  --color-primary: #4a6b55;
  --color-base-100: #ffffff;
  /* … */
}

/* elements/Button/Button.css */
@reference "../../themes/base.css";

@layer ui.elements {
  .e-button {
    @apply btn btn-sm;
  }

  .e-button--primary {
    @apply btn-primary;
  }
}
```

### Enforcing the rules

A plain test file, `src/layers.test.ts`, reads `src/` and fails when a file breaks a structural rule, so those rules hold without relying on review. It runs with the other tests, so CI enforces it, and it needs nothing beyond the test runner.

| In | Fails when the file | Rule |
| --- | --- | --- |
| a UI folder | imports a layer above its own, or another file of its own layer | UI-1, UI-2, UI-3 |
| `elements/`, `components/` | imports from `controller/`, `view-model/`, `features/` or `models/` | UI-4 |
| `views/`, `domain-components/` | imports from `controller/` or `features/` | UI-5 |
| above `components/` | uses an HTML control: `<button`, `<input`, `<select`, `<a`, `<table` | UI-6 |
| the business folders | imports the UI framework, or uses `fetch`, `localStorage`, `window` or `document` | BIZ-3 |
| `features/` | imports another feature | BIZ-4 |
| a stylesheet | defines a class outside its own block, or has a rule outside its cascade layer | STYLE-1, STYLE-2 |
| outside `themes/` | has a hex, `rgb()`, `hsl()` or named color | STYLE-6 |

**Left to review:** the rules that take judgment, which no test can read: what makes one feature, that flows and the controller hold no business rules, that a big change gets a new piece instead of a branch, and whether a piece is a view or a domain component.

Linter rules (such as ESLint with eslint-plugin-boundaries, and Stylelint) could check some of this in the editor, at the cost of more dependencies.

## A worked example

One small page, built three ways: without Blossom, with Blossom at its smallest, and with Blossom at full size. Then the same next change is made to each.

### The problem

A team needs one page that lists its tasks, with a button to pin a task and a button to remove it. The page reads the list from the server, and sends each pin and each removal to it.

There are two business rules: **a finished task can't be pinned**, and **only a finished task can be removed**. When an action breaks one, the page says why, above the list.

```text
Tasks
⚠ A finished task can't be pinned.          only after a refused action
Task                  Status
Write the release notes   open      [Pin]  [Remove]
Fix the login redirect    done      [Pin]  [Remove]
```

### Without Blossom

One component does everything: it fetches, holds the rules, draws and styles. It is the quickest to write, and for a throwaway prototype it may be enough.

```typescript
// TasksPage.tsx: one component fetches, holds the rules, draws and styles
export function TasksPage() {
  const [tasks, setTasks] = createSignal<Task[]>([])
  const [error, setError] = createSignal<string>()

  const load = async () => setTasks(await (await fetch('/api/tasks')).json())
  void load()

  const pin = async (task: Task) => {
    if (task.status === 'done') return setError("A finished task can't be pinned.")
    await fetch(`/api/tasks/${task.id}/pin`, { method: 'POST' })
    setError(undefined)
    await load()
  }

  const remove = async (task: Task) => {
    if (task.status !== 'done') return setError('Only a finished task can be removed.')
    await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
    setError(undefined)
    await load()
  }

  return (
    <main style={{ padding: '24px' }}>
      <h1>Tasks</h1>
      <Show when={error()}>
        <div style={{ color: '#c00' }}>{error()}</div>
      </Show>
      <table>
        <tbody>
          <For each={tasks()}>
            {(task) => (
              <tr>
                <td>{task.title}</td>
                <td>{task.status}</td>
                <td>
                  <button onClick={() => pin(task)}>Pin</button>
                  <button onClick={() => remove(task)}>Remove</button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </main>
  )
}
```

**What it costs.** The rules live in the page, so when another page gets a Pin button, its rule is copied there, and a later change must find every copy. Each new action repeats the same check, call and reload inside the component. Testing a rule needs a DOM and a mocked `fetch`. The server's addresses are in the page, and the red and the padding too. And the file grows with every requirement, with nothing to say where a change goes.

### With Blossom, minimal

The smallest size: no controller, no `Actions`, no model store and no view models. The page lays out its views, one smart view holds the logic and calls three features, a dumb view draws, and a component and elements draw the rows.

```text
TasksPage                          p-tasks: lays out its views
├─ PageHeaderView                  "Tasks"
└─ TaskList                        smart view: calls loadTasks, pinTask and removeTask; holds the list
   └─ TaskListView                 dumb view: draws the list, reports Pin and Remove clicks
      ├─ Alert                     element: why an action was refused
      └─ Table                     component: the rows, each with Pin and Remove buttons
```

The rules move into features: plain functions over an `api`, tested with a fake one.

```typescript
// models/outcome.ts: what an action's feature answers
export type Outcome = { type: 'done' } | { type: 'refused'; reason: string }

// features/pin-task.ts: the rule lives here, not in the smart view
export async function pinTask(api: Api, task: Task): Promise<Outcome> {
  if (task.status === 'done') return { type: 'refused', reason: "A finished task can't be pinned." }
  await api.pinTask(task.id)
  return { type: 'done' }
}

// features/remove-task.ts: a second action is a second feature, with its own rule
export async function removeTask(api: Api, task: Task): Promise<Outcome> {
  if (task.status !== 'done') return { type: 'refused', reason: 'Only a finished task can be removed.' }
  await api.removeTask(task.id)
  return { type: 'done' }
}
```

The smart view holds the list and wires the view to the features. Its logic sits in a plain `.handle.ts` file, so tests call it with the fake `api` and no DOM:

```typescript
// smart-views/TaskList/TaskList.tsx
export function TaskList(props: { api: Api }) {
  const [tasks, setTasks] = createSignal<Task[]>([])
  const [error, setError] = createSignal<string>()
  const state: TaskListState = { setTasks, setError }
  void load(props.api, state)
  return <TaskListView tasks={tasks()} error={error()} onEvent={(event) => void handle(event, props.api, state)} />
}

// smart-views/TaskList/TaskList.handle.ts
/** Runs the feature the event asks for, then shows why it was refused, or loads the list again. */
export async function handle(event: TaskListEvent, api: Api, state: TaskListState): Promise<void> {
  const outcome = await run(event, api)
  if (outcome.type === 'refused') {
    state.setError(outcome.reason)
    return
  }
  state.setError(undefined)
  await load(api, state)
}

/** Each event to its feature; a new event fails to compile until it has a case here. */
function run(event: TaskListEvent, api: Api): Promise<Outcome> {
  switch (event.type) {
    case 'pin':
      return pinTask(api, event.task)
    case 'remove':
      return removeTask(api, event.task)
  }
}
```

The view is dumb: it draws what it is given and reports clicks, without knowing what they mean.

```typescript
// views/TaskListView/TaskListView.tsx
export type TaskListEvent = { type: 'pin'; task: Task } | { type: 'remove'; task: Task }

export function TaskListView(props: { tasks: Task[]; error?: string; onEvent: (event: TaskListEvent) => void }) {
  const columns: Column<Task>[] = [
    { title: 'Task', cell: (task) => task.title },
    { title: 'Status', cell: (task) => task.status },
    {
      title: '',
      cell: (task) => (
        <>
          <Button onClick={() => props.onEvent({ type: 'pin', task })}>Pin</Button>
          <Button onClick={() => props.onEvent({ type: 'remove', task })}>Remove</Button>
        </>
      ),
    },
  ]
  return (
    <section class="v-task-list" data-testid="v-task-list">
      <Show when={props.error}>{(error) => <Alert tone="error" text={error()} />}</Show>
      <Table columns={columns} rows={props.tasks} />
    </section>
  )
}
```

**What it gives.** Each rule is in one function, with a test that runs in Node on the fake `api`. The second action was a second feature, one more event in the view and one more case in `handle`; nothing else changed. The server's addresses are behind the `api`, and the look is in the components and the theme.

### With Blossom, full size

The same page with every layer: repos over storage, a controller that holds the page's state, a view model, and `Actions`. The view, the component and the elements are the same files, and the features are the same functions over a repo in place of the `api`. Only the wiring changes: the smart view calls an action, and the controller runs the features.

```typescript
// repos/tasks-repo.ts: speaks models; reading the server's JSON stays here
export interface TasksRepo {
  list(): Promise<Task[]>
  pin(id: TaskId): Promise<void>
  remove(id: TaskId): Promise<void>
}

export function createTasksRepo(http: HttpClient): TasksRepo {
  return {
    list: async () => parseTasks(await http.get('/tasks')),
    pin: async (id) => {
      await http.post(`/tasks/${id}/pin`)
    },
    remove: async (id) => {
      await http.delete(`/tasks/${id}`)
    },
  }
}

// view-model/tasks.ts: what the page draws, as plain data
export type TasksModel = { title: string; tasks: Task[]; error?: string }

// controller/tasks.ts: the page's area; holds its state, runs features, writes the model store (BIZ-6)
export function createTasksArea(state: ControllerState) {
  let tasks: Task[] = []
  let error: string | undefined

  const publish = () => state.update((model) => ({ ...model, tasks: tasksModel(tasks, error) }))

  const load = async () => {
    tasks = await loadTasks(state.repos.tasks)
    publish()
  }

  /** Waits for an action's feature, then shows why it was refused, or loads the list again. */
  const settle = async (running: Promise<Outcome>) => {
    const outcome = await running
    error = outcome.type === 'refused' ? outcome.reason : undefined
    if (outcome.type === 'done') tasks = await loadTasks(state.repos.tasks)
    publish()
  }

  // The list's part of Actions['tasks']; other areas implement the rest.
  const actions: Pick<Actions['tasks'], 'pin' | 'remove'> = {
    // Each returns at once; the work runs on.
    pin: (task) => void settle(pinTask(state.repos.tasks, task)),
    remove: (task) => void settle(removeTask(state.repos.tasks, task)),
  }

  return { actions, opened: () => void load() }
}

// smart-views/TaskList/TaskList.handle.ts: each event to one action; tested with the fake Actions
export function handle(event: TaskListEvent, actions: Actions): void {
  switch (event.type) {
    case 'pin':
      return actions.tasks.pin(event.task)
    case 'remove':
      return actions.tasks.remove(event.task)
    default:
      event satisfies never
  }
}
```

**What it adds.** The page's state has one home, the controller, so another page can show the same tasks, and a change on one page can reach the others. The page has a URL and the back button works. The controller is tested by calling its actions with fake repos, and the smart view by calling `handle` with the fake `Actions`.

### The next change

Later, the task's detail page gets the same Pin button, and the rule grows by one condition: a task that is already pinned can't be pinned again.

**Without Blossom,** the pin code is copied into the detail page, and the new condition must be added to both copies. A missed copy lets the wrong tasks be pinned, and only a test with a DOM would show it.

**With Blossom, minimal,** the detail page's smart view calls the same `pinTask`, and the new condition is one line in `features/pin-task.ts`, with its test. But the list doesn't know a task was pinned on the detail page until it loads again: two smart views now share data, which is the sign to grow.

**With Blossom, full size,** the detail page calls the same `actions.tasks.pin`, so the rule changes in one place, and the controller tells the list to load again when a task changes. If the detail page needs a different kind of pin, such as "pin for the whole team", it gets a new feature beside the old one, not a branch inside it (BIZ-7).

**In React,** the features, the repo, the view model, `Actions`, the controller and every `handle` are the same files. Only the components change: hooks in place of signals, `className` in place of `class`, and `map` with a `key` in place of `For`.

## Discussion

What the structure gives a team day to day, what it costs, and how small it can get.

### What it gives you

#### Finding where a problem is

Each kind of problem points to one layer, so a bug can be narrowed down before reading any code.

- **One part of the page is wrong.** A page is split into views that each solve their problem on their own, so start with that view, its smart view and the logic it calls. The other views can be left aside.
- **A layout or a color is off.** Inspect it: `e-button` is the Button element, `c-table` the Table component, `p-tasks` the TasksPage. Spacing comes from the layers above components; a wrong color is never in a page, and one wrong in only one product is in that product's theme.
- **The screen shows the wrong data.** The UI draws only the view model. If the model is wrong, the problem is in `view-model/` or `features/`, and a test reproduces it in Node. If it is right, the problem is in the view that draws it.
- **A click does the wrong thing.** A smart view's `handle` is a plain function, so a test with the fake `Actions` shows which action an event calls, and with what.
- **A rule gives the wrong result.** Features are plain functions chained by flows, so swap one for a dummy that returns fixed data; if the problem goes away, it was in that feature.

#### Reviewing a pull request

The file path says what a change may do: a change under `components/` can't touch the business, and one under `features/` can't touch the UI. Imports in the wrong direction and colors outside the themes fail the layers test before anyone reads the code, so review time goes to the logic and the look. Rules have names, so a comment can cite one instead of arguing it again.

#### Working in several teams

The layers are horizontal slices: a design-system team can own `elements/`, `components/` and `themes/`, each product team its pages and views, another team the business, and another the contract with the server. The contracts between slices are types, so when one changes, the compiler shows every place that has to follow.

#### Switching features on and off

Each piece has one way in: a feature is one function, an action is one entry in `Actions`, and a page is one route. So a step of a flow, an action, a view or a whole page can be switched off in one place, and the UI needs no if-else: it draws whatever the view model holds.

#### Working with an AI assistant

A change follows the imports. To change page A, an assistant reads page A and only what it imports; imports only go down and views can't import each other, so nothing else can change what page A does. And what it didn't read can't quietly break a rule: the type checker catches wrong props, and the layers test catches imports and styles in the wrong place. A short `CLAUDE.md` (or your assistant's equivalent) that lists the folders, what each may import, and the rules that are never broken goes a long way; Appendix B.3 has one to start from.

### Trade-offs

**Pros:** a clear boundary between products with most of the UI shared; parts that carry over to new projects (whole layers, only the logic, only the style or only the components); fast tests of the business in Node; problems that are easy to locate; pull requests that are easy to review; a consistent look; few dependencies; a business that outlives the UI framework; and a structure that scales down and grows back.

**Cons, and how to live with them:**

| Con | How to live with it |
| --- | --- |
| **More files and folders.** A new page touches the route, a repo, features, a view model, actions, the controller, the page and its views. | Each place is small and has one job, the layers test points out anything misplaced, and a small project can merge layers. |
| **A learning curve.** Six UI layers, dumb and smart views, and a set of rules. | The at-a-glance section, rule names to look up, and a test that fails with the file and the rule it breaks. |
| **Props passed through several layers.** | On purpose: each layer's inputs stay visible in its props type. Pages pass each view only the part of the model it needs. |
| **Strict composition.** Components can't use other components, so some UI is built with slots. | Slots cover most cases, and a business piece built from several components is a domain component, which may use any component. |
| **Views and domain components are close.** Where one ends and the other begins takes judgment. | Ask what it is, then take it away. A move is a folder and a prefix, and the layers test checks the result, so a wrong first guess is cheap to fix. |
| **The controller's state is written by hand.** Loading, busy and error state, aborts and late answers. | Every area has the same shape, so one reads like the next. A UI-free query cache can go inside a repo when it is needed. |

### Scaling down

A small project doesn't need every layer. Layers merge from the bottom up, so the app has fewer folders while imports still go downward and the business still stays out of the UI. Start as small as the project allows, and split a layer back out when it is needed.

| Size | UI layers | When |
| --- | --- | --- |
| Full | pages → smart views → views → domain components → components → elements | several products or teams, and a shared design system |
| Smaller | pages → smart views → views → domain components → components | a small design system: elements merge into components |
| Smaller still | pages → smart views → views → components | views draw their pieces themselves |
| Smallest | pages → views → components | pages wire their views themselves |

| Size | Business and data | When |
| --- | --- | --- |
| Full | `controller/`, `view-model/`, `features/` with `flows/`, `repos/`, `storage/`, `shared/`, `models/` | many features, several kinds of data |
| Smaller | the same, with repos and storage merged into one `api/` | a few kinds of data from one server |
| Very small | `controller/`, `features/`, `api/`, `models/` | a few simple pages |
| Smallest | `features/`, `api/`, `models/` | a prototype or a tool of a page or two |

**The smallest app** is the minimal version of the worked example: no controller, no `Actions`, no model store; smart views call features themselves. **Grow** when two smart views need the same data, when state must outlive a page, or when one action takes several steps. The features don't change.

**What stays at any size:** imports go downward, views and components stay dumb, elements and components stay business-agnostic, business rules stay in plain functions, and effects stay behind an interface.

### A live example: this site

The site you're reading is built with Blossom at its smallest size, and its code is public: [`src/` on GitHub](https://github.com/longhoang0304/longhoang0304.github.io/tree/main/src). Unlike the app this came from, you can open it and check every claim above against real files.

| Blossom | This site |
| --- | --- |
| The UI layers | `pages/` → `views/` → `components/` → `elements/`, with a `shell/` that every page wraps itself in |
| The business | `features/` only: plain functions, one job per file, such as `format-date.ts`, `reading-time.ts` and `tag-counts.ts`. There is no controller, `Actions` or model store, because a static site has no state to hold |
| Data | Astro content collections, read in one feature, `site-posts.ts`, which does the job a repo would |
| The layers test | `src/layers.test.ts` checks UI-1 to UI-3, UI-6, STYLE-6 and that `features/` hold no UI. It runs before every build, so a broken rule stops the deploy |

**Where it bends the rules:**

- **No smart views.** Pages wire their views themselves, as the smallest size allows. The little behavior there is, such as search and the theme toggle, is a plain function in `features/`, started by the page or element that needs it.
- **No class prefixes or cascade layers.** Astro scopes each file's styles to that file, which does the job STYLE-2 and the cascade layers do here.
- **The shell sits below the pages.** In Astro a page wraps itself in its layout, so the shell is imported by pages and imports views, rather than picking the page.
- **Markdown is styled from outside.** A post is rendered Markdown with no classes of its own, so the `Prose` component styles its tags directly.

## Related work

The business and data layers have no framework in them and carry over unchanged. The terms map like this:

| React | SolidJS | Blossom |
| --- | --- | --- |
| container component | a component that wraps another | smart view, wrapping a dumb view |
| presentational component | component | dumb view, domain component, component, element |
| context and providers | `createContext` | the controller, the model store and the repos, built once by the entry; no context for business data |
| a store (Zustand, Redux) | `createStore` | the model store, written only by the controller |
| Redux actions and thunks | none | `Actions`: typed functions the controller implements |
| `useState` | `createSignal` | `create…State()` primitives |

**Beyond the web.** At its core, Blossom is a set of boundaries and one direction of flow: the UI draws a model and reports what the user asks for, the business turns each request into a new model, and effects sit behind interfaces. That shape, often called unidirectional data flow or model-view-update, works as well for a Flutter app, a WPF app or a Rust terminal UI. There, the layers test can be replaced by the build: one package, project or crate per layer, each depending only on the ones below, and an upward import fails to compile.

Most of the parts exist elsewhere under other names. The closest match is Android's recommended app architecture: a UI layer with state holders, a domain layer of use cases, and a data layer of repositories.

| Here | Also called | Why it differs here |
| --- | --- | --- |
| Actions | actions, messages, intents, commands | typed functions, not objects sent through one `dispatch`: the compiler checks every call |
| Controller | presenter, store, BLoC, state holder | it holds the state around the features; the rules stay in features |
| View model | presentation model, UI state | plain data built by pure functions, easy to test, copy and compare |
| Features | use cases, interactors | one plain function per file, not a class per use case |
| Repos and storage | repositories and data sources, ports and adapters | one repo per kind of data; storage is the only place with effects |
| Smart and dumb views | container and presentational components | separate folders, so a test can check that only smart views call `actions` |
| The UI layers | atoms, molecules, organisms, templates, pages | sorted by what each solves, not by size |

## Alternatives and open questions

Some ideas were weighed and dropped. I keep them written down, with the reason, so they aren't proposed again without a new one.

**Domain components inside `components/`: rejected.** A task form needs form groups, selects and maybe a dialog, which are components, and components don't use other components. `components/` is also the design system, which other projects take as it is, and a piece that knows the business can't travel with it.

**Smart domain components: rejected.** A domain component that calls `actions` itself, so the views using it don't repeat its wiring. It would need `actions` as a prop, so a dumb view couldn't place it without stopping being dumb. Each view's smart view wires the domain components in it instead.

**Reuse decides between a view and a domain component: replaced.** It made the layer depend on how a piece happened to be used, so the same kind of piece landed in different layers. Replaced by what a piece *is*: a sub-problem of the page, or a piece of a solution.

**Injecting data and actions into views: still researching.** Smart views exist because a front-end has no easy way to inject what a view needs. In Java or Go, a container or plain constructors hand each part its dependencies. In React or SolidJS, context reaches every layer below its provider, so any component could take the controller. Whatever replaces smart views must keep what they give: one visible place where logic and data meet a view, pages that only lay out, and a test that can still check which files call `actions`.

## Conclusion

**Blossom is a guideline, not a standard.** It writes down what worked for us, and why, so a team can start from it rather than from nothing.

**Take what fits.** A project can use all of it, a few layers of it, or only the ideas behind it: the business kept apart from the UI, one direction of flow, and the look kept in one place. Once a project picks its rules, it keeps them, and the layers test checks them, so the code stays consistent for everyone who works on it.

**Explore further.** If something here gets in the way, or a better idea comes up, try it. Write down the problem it solves and what it costs, and Blossom grows with it.

## Further reading

- Android Developers, [Guide to app architecture](https://developer.android.com/topic/architecture): UI, domain and data layers; the closest match to Blossom.
- The Elm guide, [The Elm Architecture](https://guide.elm-lang.org/architecture/): model, view and update, the one-way flow Blossom follows.
- Dan Abramov, [Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) (2015): the idea behind dumb and smart views.
- Brad Frost, [Atomic Design](https://atomicdesign.bradfrost.com/) (2016): layers sorted by size, where Blossom sorts by what each solves.
- Robert C. Martin, *Clean Architecture* (2017): use cases and boundaries, one way to build the business layer.
- MDN, [`@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer): the CSS cascade layers the styling rules use.

## Appendix A: The rules

Every rule the paper refers to, in one place. Each has a name, so a code review can say "this breaks UI-5" instead of arguing it again.

### UI rules

**UI-1. Imports go downward only.** Shell → pages → smart views → views → domain components → components → elements. A layer may skip down, but never import up.

**UI-2. No imports within a level.** A page doesn't use another page, a view another view, an element another element.

**UI-3. Components don't use other components,** and domain components don't use other domain components. A component that wraps content (dialog, panel, tabs) takes it as a slot the caller fills. So "a dialog with a form in it" is a view, or a domain component, that puts a form group into a dialog.

**UI-4. Elements and components are business-agnostic.** They take UI data: text, a tone, rows, column specs. The more of the UI that is dumb, the more of it carries over to other projects.

**UI-5. Only pages and smart views call `actions`.**

**UI-6. HTML controls and visual styles stay in elements and components.** They write `button`, `input`, `select`, `textarea`, `a` and `table` with their accessibility, and own color, type and borders. The layers above use HTML and CSS only for layout. This keeps the look consistent.

**UI-7. Events go up through callback props.** Named ones (`onPin`, `onRemove`) when a piece has a few events, or one `onEvent` with its own event union when it has many. With `onEvent`, the smart view handles them all in one switch, and a new event fails to compile until it has a case.

**UI-8. UI control logic lives in a `create…State()` primitive.** Its transitions are plain functions that tests call without the framework or a DOM; the primitive only holds the signals.

### Business rules

**BIZ-1. One feature per file,** named after what it does (`pin-task.ts`), never after a role (`task-service.ts`, `manager.ts`). With object-oriented services, a function is bound to its class: to use one operation, the caller builds the whole class with everything its constructor needs, and a test has to build or mock all of it. A feature file exports a plain function that takes data and the repos it needs, and returns data.

**BIZ-2. Functions, not services.** Data are types, not classes, because models and view models are copied and compared as plain data.

**BIZ-3. Pure functions, effects at the edge.** No module-level state, and no `fetch`, `localStorage`, `window` or `document` in `features/`. Changing local variables inside a function is fine; don't bend TypeScript to look pure.

**BIZ-4. Features don't import other features.** When a second feature needs some code, move it down then, not before: functions to `shared/`, types to `models/`.

**BIZ-5. Flows chain features into one action** (create a task: validate the form, save the task, notify the assignee) and hold no rules of their own. Only the controller runs flows.

**BIZ-6. The controller holds the state; features hold the rules.** Each area of the controller keeps what its page is working on, what is loading, running or failed, and which dialog is open. For each action it runs a feature or flow, aborts a run that a newer one replaces, drops an answer that arrives after the user has moved on, and writes its page's model to the store in one place.

**BIZ-7. A new piece, not a branch.** When a big change would change what other callers rely on, write a new feature beside the old one, and point only the callers that need it at the new one. Don't add an `if`/`else` to shared code for it: branches spread to every caller, and later nobody can tell which path ran. Duplicating is fine; once both settle, move what they share down. An `if`/`else` is right when the condition is part of the rule itself, such as when a task is overdue.

### Repo rules

**REPO-1. One repo per kind of data,** named after the data, not its source: `tasks-repo.ts`, never `http-tasks.ts`.

**REPO-2. Repos speak models.** Reading and writing wire formats happens in the repo, never in features.

**REPO-3. Repos hold no business rules.** They choose the source and may cache, but what the data means is decided in features.

**REPO-4. Features take repos, never storage.** Only the entry builds storage and repos, so swapping a source, or a fake for a test, is one change in one place.

**REPO-5. Storage is small, generic, and the only place with effects.** It knows nothing of the business, so another project can reuse it as it is.

### Style rules

**STYLE-1. One stylesheet per file that draws,** beside its `.tsx`, imported only by it.

**STYLE-2. Class names start with their layer's prefix,** then the block and BEM: `.c-table__head`, `.e-button--primary`. A stylesheet styles only its own block, never bare tags or another file's classes.

**STYLE-3. Each control is styled once,** in its element or component, so changing the button's padding changes every button on every page. That is what makes a design system easy to build and change.

**STYLE-4. Above components, layout only:** display, flex, grid, gap, padding, margin, size. Color, type, borders and shadows belong to elements and components.

**STYLE-5. States use attributes,** not modifier classes: `[aria-selected="true"]`, `:disabled`, `[data-state="open"]`. The style then can't drift from what assistive technology is told.

**STYLE-6. Every color comes from the theme.** No hex, `rgb()` or named color outside `themes/`, so every product and mode works everywhere.

**STYLE-7. Ids and test ids use the same names as classes:** `data-testid="v-task-form__submit"`. Inspect anything in the browser, and its name says which file to open.

## Appendix B: Reference

### Where state lives

| State | Examples | Where |
| --- | --- | --- |
| Business state | queries, the data a page is working on, running actions, prompts, form errors | the controller, as plain TypeScript |
| What the screen draws | every page's view model, prompts, the toast | the model store, written only by the controller |
| Data kept between calls | the session, reference lists such as labels, pages already loaded | an in-memory cache in `storage/`, behind a repo |
| Data saved on the device | preferences such as page size, the light or dark choice | local storage in `storage/`, behind a preferences repo |
| Current page | which page is open | `model.route`, kept in step with the URL by the shell |
| UI control state | selection, focus, an open menu, text being typed | a `create…State()` primitive beside the component that owns it |
| UI state that views share | a selection that a list and its detail both show | the page, passed to its views |
| UI state that outlives a page | a list's selection while one of its items is open | the shell, passed to the page |

### A model store in SolidJS

```typescript
// src/solid-model-store.ts: beside the shell, since it imports the UI framework
export function createSolidModelStore(initial: AppModel): ModelStore & { readonly view: AppModel } {
  let model = initial
  const [view, setView] = createStore<AppModel>(structuredClone(initial))
  return {
    view,
    get: () => model,
    update(change) {
      const next = change(model)
      batch(() => {
        for (const key of keysOf(model, next)) {
          if (next[key] !== model[key]) setView(key, reconcile(structuredClone(next[key])))
        }
      })
      model = next
    },
  }
}
```

### A sample CLAUDE.md

A starting point for a Blossom project's `CLAUDE.md`, so an AI assistant such as Claude Code follows these rules on every change. Copy it to the project's root, fill in the commands, and list the project's own exceptions in its `docs/architecture.md`. For a project at a smaller size, adjust the folder table (for example, one `api/` instead of `repos/` and `storage/`).

```markdown
# CLAUDE.md

This front-end follows **Blossom**:
https://longhoang.me/research/r1-blossom-front-end-architecture
Rule IDs below (UI-1, BIZ-3 …) are the post's. Project-specific choices and
exceptions are in `docs/architecture.md`. If a change doesn't fit a rule, stop
and ask; never bend a rule to make code fit.

## Commands

- Test: `<yarn test>`. It includes `src/layers.test.ts`, which enforces most
  rules below. Run it before you say a change is done.
- Type check and build: `<yarn build>`
- Run on fake data: `<yarn dev:fake>`

## Where code goes

Imports only go down this table. A folder may skip downward, never upward,
and never sideways within the same level (UI-1, UI-2).

| Folder | Holds | May import |
|---|---|---|
| `pages/` | one page; lays out views, holds the UI state they share | lower UI layers; types from `controller/`, `view-model/`, `models/` |
| `smart-views/` | the logic: wires one view, and the domain components in it, to `actions` | views and below; the same types |
| `views/` | dumb: one sub-problem of a page, as a region of it; reports its events through callbacks | domain components, components, elements; view-model and model types |
| `domain-components/` | dumb: a piece of a solution that views are built from (due-date card, task form) | components, elements; view-model and model types |
| `components/` | dumb: a UI problem, layouts included: table, dialog, tabs | elements |
| `elements/` | the smallest UI piece: button, text input | nothing from the UI or the business |
| `controller/` | business state; implements `Actions`; writes the model store | `view-model/`, `features/`, repo types, `shared/`, `models/` |
| `view-model/` | one plain-data model per page | `shared/`, `models/` |
| `features/` | one business rule or action per file; `flows/` chain them | repo types, `shared/`, `models/` |
| `repos/` | data access, one repo per kind of data, speaking models | `storage/`, `shared/`, `models/` |
| `storage/` | the only effects: HTTP, local storage, cache | `shared/`, `models/` |
| `shared/` | functions used by two or more features, or features and repos | `models/` |
| `models/` | types and their own functions | nothing |

UI folders import from `models/` with `import type` only; elements and
components import nothing from it.

## Rules that are never broken

- Elements and components know nothing about the business: no imports from
  `controller/`, `view-model/`, `features/` or `models/` (UI-4).
- Logic comes from smart views: only pages and smart views call `actions`,
  and no component, generic or domain, does. No UI file holds the
  controller, and nothing uses context for business data (UI-5).
- Components, domain components and views report events through callback
  props: named ones (`onPin`, `onRemove`) when they have a few, one `onEvent`
  with an event union when they have many or pass on their pieces' events.
  Hover and focus that only change UI state stay in the component's
  `.state.ts`. Wiring longer than a line goes in the smart view's
  `.handle.ts`, so it is tested (UI-7, UI-8).
- Only elements and components write HTML controls (`button`, `input`,
  `select`, `textarea`, `a`, `table`) and visual styles. Domain components,
  views and pages use only layout: containers with flex, grid, gap,
  padding, margin and size (UI-6, STYLE-4).
- Components don't use other components, and domain components don't use
  other domain components; pass content as slots (`children` or a named
  `JSX.Element` prop) (UI-3). A domain component may use any component. A
  cross import between two elements or two components needs a recorded
  exception in `docs/architecture.md` first: one way, one level, with its
  reason.
- Business rules live in `features/`, never in the UI or the controller. The
  controller holds each area's state (loading, running, busy, errors, open
  dialogs), runs a feature or flow with the repos it needs, and writes the
  model store (BIZ-6).
- One feature per file, named after what it does (`pin-task.ts`): a plain
  function over plain data, with its test beside it. No classes, no
  services, no `utils.ts` or `helpers.ts` (BIZ-1, BIZ-2).
- Features take the repos they need as arguments. `fetch`, `localStorage`,
  `sessionStorage`, `window` and `document` appear only in `storage/` (BIZ-3,
  REPO-4).
- Features don't import features. A flow chains them, and only the
  controller runs flows (BIZ-4, BIZ-5).
- Only the controller writes the model store; features return data.
- Every color comes from a theme: no hex, `rgb()`, `hsl()` or named color
  outside `themes/` (STYLE-6).
- Prefer a new piece to a branch. When a big change to business logic or UI
  would change what other callers rely on, write a new feature, flow, view
  or component beside the old one, and point only the callers that need it
  at the new one. Don't add an `if`/`else` or a flag to shared code for it:
  branches spread, and later nobody can tell which path ran. Duplicating is
  fine; once both settle, move what they share down (BIZ-4). An `if`/`else`
  is right when the condition is part of the rule itself, such as when a
  task is overdue (BIZ-7).
- Don't add a dependency (router, state-management or data-fetching library,
  UI kit) without asking.

## Naming

- UI components: one folder per component, PascalCase, the file named after
  its export, with its siblings beside it:
  `components/Table/Table.tsx`, `Table.css`, `Table.state.ts`,
  `Table.state.test.ts`.
- Dumb views end in `View`, pages in `Page`; a smart view takes the plain
  name (`TaskTableView` is wrapped by `TaskTable`).
- Everything else is kebab-case, named after what it holds
  (`tasks-repo.ts`, `chevron-down.svg`).
- Classes, ids and test ids: layer prefix + block + BEM. `e-` elements, `c-`
  components, `d-` domain components, `v-` views, `p-` pages:
  `.c-table__head`, `.e-button--primary`,
  `data-testid="v-task-form__submit"`. The file that knows what a thing is
  names it; smart views only pass on their caller's `testId`, adding a
  suffix (STYLE-2, STYLE-7).

## Styling

- One stylesheet per file that draws, with the same name, imported only by
  its `.tsx`. It starts by referencing the shared base and wraps every rule
  in `@layer ui.<its layer>` (STYLE-1).
- Style only your own block: never bare tags, ids or another file's classes
  (STYLE-2).
- In elements and components, group framework classes into ours
  (`.e-button { @apply btn btn-sm; }`). In domain components, views and
  pages, put at most three layout utilities in markup; more go into a `d-`,
  `v-` or `p-` class.
- Show states with attributes (`aria-selected`, `aria-invalid`,
  `data-state`), not modifier classes (STYLE-5).

## State

- What the screen draws: view models built in `view-model/`, written to the
  model store by the controller.
- Data kept between calls or saved on the device: behind a repo.
- UI control state (selection, focus, an open menu, text being typed): a
  `create…State()` primitive in a `.state.ts` file beside the component that
  owns it, with its transitions as pure functions (UI-8). State that several
  views share goes in their page; state that outlives a page, in the shell.
- Text the user types stays in UI state until submit; the smart view then
  calls one action with the whole form.

## Tests

- Keep logic out of markup: in `.state.ts` functions, in smart views'
  `handle(event, …, actions)` in a `.handle.ts` file, in features and in view
  models. Test each beside its file, in Node.
- Smart views: call `handle` with the fake `Actions` and compare its recorded
  calls. Features: test with fake repos. View models: build from data and
  compare.

## Adding a page: what to read

Read only what the page touches. Imports only go down and views can't import
each other, so nothing else can change what the page does; the type checker
catches wrong props, and the layers test wrong imports.

1. The spec: that page's part of the design or ticket.
2. Sketch the page's regions: each region that solves one of its problems is
   a view. That is the list of what to find.
3. Pick pieces by name: list `elements/`, `components/` and
   `domain-components/`, and read only the props of the ones the page uses
   (the top of each file), not their bodies, state or stylesheets.
4. Read one existing page of the same shape as a template, its whole slice:
   page, smart views, views, controller area, view model and features.
5. Read the contracts the page plugs into, only the parts you change:
   `models/route.ts`, the repos it needs and their fakes,
   `controller/actions.ts`, `controller/index.ts`, `view-model/app.ts` and
   the shell.

Don't read other pages, their views and smart views, other features or
controller areas, or stylesheets. Read more only when a piece almost fits
(read its body before changing it), when the page changes what another page
shows (the controller's hooks between areas), or when its UI state must
outlive the page (the shell).

## Adding a page, in this order

1. A route variant in `models/route.ts`, with tests both ways.
2. Repo methods, or a new repo, each with its fake.
3. Features with tests; a flow if one action takes several steps.
4. The page's view model in `view-model/`, its `Actions` group, and the
   controller's area file.
5. The page, its dumb views and their smart views, each `handle` in a tested
   `.handle.ts`, and the domain components they are built from.
6. Stylesheets (layout only above components) and test ids. Then run the
   tests.

## If the app is translated

i18n is optional. When it is used: the UI holds no text of its own; view-model
builders turn message keys into text with the current catalog; catalogs come
through a translations repo; dates, numbers and plurals are formatted with
the locale in view models.
```
