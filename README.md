# Sohaye — Personal Portfolio Website

A premium, highly interactive, and responsive personal portfolio website built with a dark cinematic theme, liquid glass aesthetics, and creative user interactions.

## 🚀 Live Demo & Repository
*   **LinkedIn Post:** [https://www.linkedin.com/posts/areej-zahra-120357416_frontenddeveloper-reactjs-typescript-ugcPost-7483105994491789312-vru4/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAGnFSOgBo5CjC2NZTey6_IdXSQncQkD-TqM]
*   **Repository:** [https://github.com/AreejZahra92/Personal-Portfolio-Website](https://github.com/AreejZahra92/Personal-Portfolio-Website)

---

## 🛠️ Built With

*   **Languages:** TypeScript, JavaScript, HTML5, CSS3
*   **Core Framework:** React 19 + Vite (for fast HMR and optimized production builds)
*   **Styling:** Tailwind CSS v3 (Utility classes) + Vanilla CSS (for custom liquid-glass components)
*   **Icons:** Lucide React
*   **APIs & Browser Features:** 
    *   **Web Audio API:** For real-time sound effect synthesis.
    *   **RequestAnimationFrame:** For 60 FPS animation/timing threads.
    *   **HTML5 Canvas & Video APIs:** For cinematic loops.

---

## ✨ Key Features & Technical Details

### 1. Spaceship Cursor & Physics Easing
On non-touch devices, the standard mouse cursor is hidden and replaced with a custom **Spaceship SVG**.
*   **Directional Rotation:** The application continuously calculates the directional vector of mouse movement and rotates the spaceship to point in the direction of flight.
*   **Inertia Gliding:** Utilizing linear interpolation (`lerp`), the ship floats with a smooth drift effect behind the mouse rather than snapping rigidly.
*   **Engine Thruster Glow:** Features a pulsing engine flame animation at the tail of the ship.

### 2. Live Web Audio Synthesizer (No MP3 files loaded!)
To make the site interactive and engaging, all sound effects are synthesized dynamically in code using the **Web Audio API**:
*   **Engine Hum (Thruster):** Synthesizes a persistent deep engine roar (55Hz triangle wave with a 140Hz lowpass filter). The volume ramps up to `0.04` during active mouse movement and decays smoothly to `0` when static.
*   **Hover Sweep:** Generates an upward pitch sweep (260Hz to 540Hz sine wave) on link/button hovers.
*   **Laser Zap:** Plays a downward laser-zap frequency sweep (880Hz to 80Hz sawtooth wave) on any page click.

### 3. GPU-Accelerated Video Background
*   **60 FPS Timing Loop:** Replaced the default low-frequency HTML5 `onTimeUpdate` event with a `requestAnimationFrame` monitor to start the 500ms video fade-out precisely at `0.55 seconds` remaining.
*   **GPU Painting:** Added `will-change: opacity` and `translate3d(0, 17%, 0)` to offload layout paints to the graphics processor, ensuring lag-free rendering.

### 4. Interactive "Manifesto" Modals
An overlay containing structured sections of Areej Zahra's CV:
*   **About:** Personal background as a Computer Science student at Sukkur IBA University.
*   **Projects:** Detailed project cards with direct GitHub source links:
    *   *Air Fruit Ninja* (Python / Computer Vision hand-tracking slicing game)
    *   *Air Drawer* (Python / OpenCV / MediaPipe air sketch tool)
    *   *Caesar Cipher Encryption Tool* (C++ Security)
    *   *Password Strength Checker* (Python Security)
*   **Certificates:** Google Professional credentials (AI, Cybersecurity, Data Analytics) with PDF views and verification redirect buttons.
*   **Experience:** Details on internships at Flyrank (Front End Engineer), DecodeLabs (Cybersecurity Analyst), and CodeAlpha (Graphic Design).
*   **Skills:** Tag badges grouping languages, methodologies, and academic courses.

---

## 📂 Project Structure

```text
portfolio-hero/
├── public/
│   ├── certificates/        # Downloadable credential PDFs
│   └── areej_zahra_cv.pdf   # Original CV file
├── src/
│   ├── assets/              # Static media assets
│   ├── App.tsx              # Main UI logic, custom cursor & audio synthesis
│   ├── index.css            # Google Font imports & custom liquid-glass styles
│   └── main.tsx             # ReactDOM entrypoint
├── tailwind.config.js       # Tailwind CSS configurations
└── package.json             # Dependencies
```

---

## ⚙️ Run Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AreejZahra92/Personal-Portfolio-Website.git
    cd Personal-Portfolio-Website
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
4.  **Build for production:**
    ```bash
    npm run build
    ```
