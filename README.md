# ContentEditable Situation

https://github.com/user-attachments/assets/f000820a-8330-4417-a037-7e7f7ce89f54

> A minimal React/Vue demo illustrating the hidden complexity behind seemingly simple "dynamic variable" editors. 

## History

Back in 2024, I was working on a feature at Vidyard for building out Dynamic Variables. Building the front-end for it was complex and I built this demo to show you some of the challanges I faced. This was the final result:


https://github.com/user-attachments/assets/e506c695-fb9c-468d-a801-5cd590d53f49


This was in Vue, but in this demo, you'll see that it happens in React, too!

## The Situation

So... it helps to think of this demo as a tiny "tokenized editor" living inside a `contentEditable`. When you type something like {{firstName}}, the system swaps that text for a custom `<Tag value="firstName" onClick={} fallback={someStateThatIsGoingToChange}/>` component—a real component mounted directly into the DOM.

The tricky part is that a `contentEditable` area doesn't behave like the rest of React. The browser is constantly mutating the DOM on its own as the user types, moves the cursor, deletes characters, or pastes content. To keep things working, the editor has to tear down and rebuild pieces of DOM manually, and I didn't realize at the time... but the Tag gets mounted as its own little isolated React root...

In this demo, you'll see that when somethhing like `someStateThatIsGoingToChange`  our Tag doesn't _react_... We have a an updated value for out `fallback` prop... but inside of the `contenteditible`... it doesn't reflect that change.

That loss of automatic "reactivity" is **one** of the (many) core challenges.

## What If You Do It Without Mutating The Dom

That was the first thing I tried:

<img width="773" height="362" alt="More issues" src="https://github.com/user-attachments/assets/6df48bf5-7618-494a-a88f-effe37e3b0a2" />

I will add an explanation here later (I can't remember all the details), but... this was causing a LOT of headaches. Things like, caret jumping to the beginning, text inside the `div contenteditible` doubling up, etc.

https://github.com/user-attachments/assets/4e8cc9c6-2378-43fe-ad82-aeb64cff21de


## Local Testing

### Prerequisites
- Node.js (v14 or higher recommended)
- npm or yarn

### Setup and Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

3. **Build for production:**
   ```bash
   npm run build
   ```
   The built files will be in the `dist` directory.

### Testing the Demo

Once running, try these interactions:
- Type text normally in the editor
- Type `{{firstName}}` or `{{lastName}}` to see variables convert to chips
- Use backspace to delete chips and observe the behavior
- Try typing before, after, and between chips
