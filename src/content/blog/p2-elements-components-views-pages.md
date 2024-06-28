---
postId: p2
postSlug: elements-components-views-pages
title: Elements, Components, Views and Pages
publishedDateTime: 2024-06-30T12:00:00Z
draft: true
description: A way to organize a frontend project structure and reasoning about a frontend project
tags:
  - frontend
  - architecture
  - project-structure
---

I like organizing things. Especially with my own project structure.
I don't have an OCD or something like that. I just want my project has the best shape.

For backend projects, N-layers architecture is my to go.
For every layer, I'll create a folder for it.
Usually it will be: `Controllers`, `Services` and `Repositories`.
I don't say it's the best, but I rarely go wrong with it.
I even applied this kind of architecture to my big cli project.
I just simply like it. That architecture only has 1 flow to follow and I can easily reason about bugs.
If something is wrong with the logic, then let's take a look at `Services` layer.
Data is not saved? It's time to debug a repository!

Then frontend projects, it made me scratching my head everytime I set up a new one.
There are so many frameworks out there. And from my perspective, each one has it own architecture.
With each architecture, I have to go with another project structure, which really annoyed me.
I wished to have one and only one project structure and maybe an architecture to rule them all.
Well then, here is it, I made it. I created my own project structure and rules for every framework.
I don't say this is a well fit every project our there. But I think it's worth to share it! :)

## Introducing Elements, Components, Views and Pages

### Overview & main components
This project structure follows a 4-layers architecture. Those layers are:
- Pages
- Views
- Components
- Elements

With a very simple rule: The upper layers depends on lower layers not vice versa.
Therefore, components from Components layer can use components from Elements layer.
However, components from Elements layer must not use components from Components layer.

<div class="post-p-image">
    <img src="/blog-assets/p2/p2-ecvp-hirachy.png" width=540>
</div>

### Elements
A component in Elements layer can be referred to an element.
Its job is to build bigger components.

#### Rules
An element should follow these rules:
- Should be simple as possible i.e: An element can be an HTML tag such as `div`, `head`.
- Should not contain any control logics. i.e: Click a button to display a pop-up.
- An element can use other elements. i.e: An text input element can use input + label elements
- Can have a logic for controlling styles. i.e: If disabled = true -> grey out.

#### Example
You want to build a radio button group like this one below

<div class="post-p-image">
    <img src="/blog-assets/p2/p2-radio-button-group-example.png" width=120>
</div>

A perfect element should be a single item in the list
```jsx
const RadioButtonItem = ({ checked, value, groupName, id }) => (
  <div>
    <input type="radio" id={id} name={groupName} value={value} checked={checked} />
    <label for={value}>{value}</label>
  </div>
)
```

It's a perfect one because
- It's simple. Only display a checkbox with a label
- It doesn't have any control logic into it

And if you have a very complex input or label. You can split them out into a separated element too.

```jsx
const RadioInput = (...) => (
  <div>
    {/* your very complex input here */}
  </div>
)
const InputLabel = (...) => (
  <div>
    {/* your very complex label here */}
  </div>
)
const RadioButtonItem = (...) => (
  <div>
    <RadioInput />
    <InputLabel />
  </div>
)
```

#### Why is control logic not allowed? 
You may wonder why an element should not contain any logic.
From my observation, we tend to share these "Elements" components IN A SINGLE PROJECT a lots.
So if I allow an element (A) has logic, you will bring that logic to another element (B).
Then you have to update that logic to match with the new element.
And then, you'll realise you need to move the HTML into another element (C) and re-use (C) in both (A) and (B).
In the end, you just accidentally create a "pure" element.
Then instead of doing it like that, I think it's better to write down that rule and enforce it.
It'll help to save time!

### Components
A component in the Components layer can be referred to a component.
A component contains many elements and other components.
I would not recommend to nest a component with logic inside another component with logic.
Thinking about you have a pop-up within a pop-up. It's not a good idea right?!

#### Rules
A component should follow these rules:
- Should not contain business logics
- Should contain control logics. i.e: Click a button to display a pop-up.

#### Example

### Views
A component in the View layer can be referred to a view.
View is where you craft a module or a part of your webpage. Multiple views will made up a web application.
A view serves a specific business need. Therefore, a view component contains a business logic.
A view should not contain another views. However, views can interact with each other by sharing states.

Example of view analysis of an Amazon product page:
<div class="post-p-image">
    <img src="/blog-assets/p2/p2-views-example.jpg" width=540>
</div>

The green section can be seen as a view - Pricing view.
The indigo section can be seen as Product information view.


#### Rules
A view should follow these rules:
- This is the place for business logic. So please put it here with a wrapper or HOC. I will talk about this later.
- View should not be nested with another view. This will help your life easier when come to testing.
- View business logic should be bounded by a boundary. For example, payment view should not contain logic about user view.
Mixing business logic will make a view hard to reason.

#### Example

### Pages
Finally, we come to the end.
Page is where you put everything together.
A Page contains multiple views.
Page will layout your web application, do the layout responsive.
Page should not contain any business logic because that's view's job.
Page should handle the logic about layout, loading screen and view transitions
The reason we need a page component because a page can be SSR or CSR. Mobile or Desktop.
Having a separated layer will make us easier to deal with these situation.

#### Rules
- Page should not contain any business logic
- Page is for layout

#### Example

### Styling Rules
- You are free to use CSS Framework such as Tailwind, Bootstrap
- Do not use a global css file for styling. If you want to have global styles, write your own CSS Framework with generic styles.
- Always use local/scoped CSS with global variables for theming
- The only global style you want to use is CSS Normalization

#### Examples
**_Vue.js_**
```vue
<style scoped>
.example {
  color: red;
}
</style>

<template>
  <div class="example">hi</div>
</template>
```

**_Astro_**
```astro
---
<div class="example">hi</div>

<style>
.example {
  color: red;
}
</style>
```

**_React_**
```jsx
import "./style.scss";

const Sample = () => (<div class="example">hi</div>)
```

_And in style.scss_
```scss
.example {
  color: red;
}
```

#### Why is only local style allowed?
Style are prone to change and I don't want to scratch my head everytime I update a random style and a random component is broken.
Also, I really don't want to abuse `important!`. And to prevent that, local style is the best option here.

Not only that, here are some other reasons: 
- You are using an element with property for style controlling. Hence, there are no reasons for you to have a global style.
- You will have more space for naming your class name. Because the style is trapped inside a scope.
- Each layer is independent hence I don't want to have a global style in an upper layer affect styles in lower layers -> Hard to debug
- Grouping style and code together helps you find the style or related code for a style faster
- Easier to copy components from one project to another without thinking too much about styles/codes. Just grab the code + attached style
- Easier to remove a component along with its styles

### Data & Business Logics
TBD

### Drawbacks and relaxed rules


### Tweaks
Please remember that these things here are a guideline for you to craft your own project structure. Nothing is 