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
I don't have an OCD or anything like that. I just want my project has the best shape.

For backend projects, N-layers architecture is my to go.
For every layer, I'll create a folder for it.
Usually it will be: `Controllers`, `Services` and `Repositories`.
I don't say it's the best, but I rarely go wrong with it.
I even applied this kind of architecture to my big cli projects.
I just simply like it. That architecture only has 1 flow to follow and I can easily reason about bugs when it happens.
If something is wrong with the logic, then let's take a look at `Services` layer.
Data is not saved? It's time to debug a repository!

Then frontend projects, it made me scratching my head everytime I set up a new one.
There are so many frameworks out there. And in my opinion, each one has it own architecture.
And each architecture, I have to go with another project structure, which really annoyed me.
I wished to have one and only one project structure and maybe an architecture to rule them all.
Well then, here is it, Elements, Components, Views and Pages. An N-Tier Architecture for Frontend project.
I don't say this is a well fit every project our there. But I think it's worth to share it! :)

## Introducing Elements, Components, Views and Pages

### Overview & main components
As I have mentioned earlier. The reason for this because I want to reason about my code easier.
To do so, I splitted a web application into 4 layers:

- Pages
- Views
- Components
- Elements

Layers above depends on the layers below it. Pages layer will depends on Views layer to craft a completed page. Views depend on Components and Components depends on Elements. With a one-way dependency like this, it helps create a one-way flow of reasoning. Which can help to understand the web application easier and make the web application self documented.

The lower layer will be more reusable than the upper layer. Elements layer will contain the most reusable components while you cannot re-use components from Pages layer.

<div class="post-p-image">
    <img src="/blog-assets/p2/p2-ecvp-hirachy.png" width=540>
</div>


## Elements
A component in Elements layer can be referred to an element. Its job is to build bigger components and be reusable.
Components in this layer is the smallest component. Hence, I will not having an element inside another element. If you do so, you are building a "Component" layer.
I find this rule will make it easier to understand element and not confusing element with component layer.

For example, if I want to build a radio button like the image below
<div class="post-p-image">
    <img src="/blog-assets/p2/p2-radio-button-group-example.png" width=120>
</div>

This is what I would do
```jsx
const RadioButtonElement = ({ checked, value, groupName, id }) => (
  <div>
    <input type="radio" id={id} name={groupName} value={value} checked={checked} />
    <label for={value}>{value}</label>
  </div>
)
```

An element can be big, but I would keep it as small and simple as possible. So that I can reuse these element easier.

But how small? You may ask. It depends!
However, my rule of thumb is that an element component can be tiny, if that element can be reused.

For example, I want to build a custom checkbox. I could simply do this
```jsx
const BeautyCheckboxElement = ({ checked, value, groupName, id }) => (
  <div>
    <div className="custom-checkbox">
      <input type="radio" id={id} name={groupName} value={value} checked={checked} />
      <div className="checkbox"></div>
    </div>
    <label for={value}>{value}</label>
  </div>
)
```

But later, I found out that my custom checkbox can be used say with another rainbow label.
Then I will split the custom checkbox into an element. Then promote `RainbowCheckboxElement` to a component.

```jsx
const RainbowCheckbox = ({ checked, groupName, id }) => (
  <div className="custom-checkbox">
    <input type="radio" id={id} name={groupName} value={value} checked={checked} />
    <div className="checkbox"></div>
  </div>
)

const BeautyCheckboxComponent = ({ checked, value, groupName, id }) => (
  <div>
    <RainbowCheckbox groupName={groupName} checked={groupName} id={id} />
    <label for={value}>{value}</label>
  </div>
)
```

Finally, an element should be dump. Meaning that it should not contain any logics except for styling.
The reason for this is to maximize the reuse capability of an element. If you put a logic to it, that element will tight to that specific logic and can only be re-used by components agree with the logic.
And by saying not containing a logic, I mean the logic should be injectable. Like a button, you should not define say fetch user button. But rather a button can accept a function to fetch a user.

```jsx
// bad
const BadButton = () => {
  const fetchUser = useCallback(() => ..., [])
  return (
    <button onClick={fetchUser}>
      Fetch User Data
    </button>
  )
}

// good
const GoodButton = ({ onClick, label }) => (
  <button onClick={onClick}>
    {label}
  </button>
)
```

As you can imagine, the `BadButton` can only be used by other components that want to fetch user data. While `GoodButton` can be used by any almost other components. Hence, an element should not contain any logics so that I can be resuable as much as possible

### Summary
In short, an element should have these characteristics:
- Simple & Small - You can describe an element with a simple sentense.
- Dump - No business logics
- Independent - An element component should not depends on other elements. Only use HTML element to build an element component.

### Less restricted characteristics:
You might think that indepedent is too dump. Why do you have to promote a simple element to a component?
Well, if you don't like it, you don't have to. You can ignore the `Independent` characteristic. Meaning an element can depend on another *element*. element can not depends on upper layer such as Components, Views because it would make your flow have a cycle and hard to debug.  

Please don't make it smart and a fat element. It would be hard to reuse these kind of elements. Unless you know what you are doing and understand it.

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

## Styling
- You are free to use CSS Framework such as Tailwind, Bootstrap
- Do not use a global css file for styling. If you want to have global styles, write your own CSS Framework with generic styles.
- Always use local/scoped CSS with global variables for theming
- The only global style you want to use is CSS Normalization

**Examples**

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

### Why is only local style allowed?
Style are prone to change and I don't want to scratch my head everytime I update a random style and a random component is broken.
Also, I really don't want to abuse `important!`. And to prevent that, local style is the best option here.

Not only that, here are some other reasons: 
- You are using an element with property for style controlling. Hence, there are no reasons for you to have a global style.
- You will have more space for naming your class name. Because the style is trapped inside a scope.
- Each layer is independent hence I don't want to have a global style in an upper layer affect styles in lower layers -> Hard to debug
- Grouping style and code together helps you find the style or related code for a style faster
- Easier to copy components from one project to another without thinking too much about styles/codes. Just grab the code + attached style
- Easier to remove a component along with its styles

## Data & Business Logics
TBD

## Drawbacks and relaxed rules


### Tweaks
Please remember that these things here are a guideline for you to craft your own project structure. Nothing is 


## Motivation & Design philosophy
