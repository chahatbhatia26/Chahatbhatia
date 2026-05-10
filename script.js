const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const year = document.querySelector("#year");
const revealItems = document.querySelectorAll(".reveal");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const offGridCarousel = document.querySelector("[data-off-grid-carousel]");
const companyVisual = document.querySelector("[data-company-visual]");
const researchCards = document.querySelector("[data-research-cards]");
const coreModules = document.querySelector("[data-core-modules]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (year) {
  year.textContent = new Date().getFullYear();
}

const updateHeaderState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

if (companyVisual) {
  if (reducedMotion) {
    companyVisual.classList.add("is-tags-visible");
  } else {
    let previousScrollY = window.scrollY;
    let companyTicking = false;
    let companyScrollIntent = 0;

    const updateCompanyTags = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - previousScrollY;
      const bounds = companyVisual.getBoundingClientRect();
      const isInView =
        bounds.top < window.innerHeight * 0.82 &&
        bounds.bottom > window.innerHeight * 0.18;

      if (
        (scrollDelta > 0 && companyScrollIntent < 0) ||
        (scrollDelta < 0 && companyScrollIntent > 0)
      ) {
        companyScrollIntent = 0;
      }

      if (Math.abs(scrollDelta) >= 0.5) {
        companyScrollIntent += scrollDelta;
      }

      if (isInView && companyScrollIntent > 12) {
        companyVisual.classList.add("is-tags-visible");
        companyScrollIntent = 0;
      } else if (
        companyScrollIntent < -12 ||
        (!isInView && bounds.top >= window.innerHeight * 0.88)
      ) {
        companyVisual.classList.remove("is-tags-visible");

        if (companyScrollIntent < -12) {
          companyScrollIntent = 0;
        }
      }

      previousScrollY = currentScrollY;
      companyTicking = false;
    };

    updateCompanyTags();
    window.addEventListener(
      "scroll",
      () => {
        if (companyTicking) {
          return;
        }

        companyTicking = true;
        window.requestAnimationFrame(updateCompanyTags);
      },
      { passive: true }
    );
  }
}

if (researchCards) {
  const useStaticResearchCards = () => reducedMotion || window.innerWidth <= 1120;

  if (useStaticResearchCards()) {
    researchCards.classList.add("is-scattered");
  } else {
    let previousResearchScrollY = window.scrollY;
    let researchTicking = false;
    let researchScrollIntent = 0;

    const updateResearchCards = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - previousResearchScrollY;
      const bounds = researchCards.getBoundingClientRect();
      const isInView =
        bounds.top < window.innerHeight * 0.82 &&
        bounds.bottom > window.innerHeight * 0.18;

      if (useStaticResearchCards()) {
        researchCards.classList.add("is-scattered");
        previousResearchScrollY = currentScrollY;
        researchTicking = false;
        return;
      }

      if (
        (scrollDelta > 0 && researchScrollIntent < 0) ||
        (scrollDelta < 0 && researchScrollIntent > 0)
      ) {
        researchScrollIntent = 0;
      }

      if (Math.abs(scrollDelta) >= 0.5) {
        researchScrollIntent += scrollDelta;
      }

      if (isInView && researchScrollIntent > 12) {
        researchCards.classList.add("is-scattered");
        researchScrollIntent = 0;
      } else if (
        researchScrollIntent < -12 ||
        (!isInView && bounds.top >= window.innerHeight * 0.88)
      ) {
        researchCards.classList.remove("is-scattered");

        if (researchScrollIntent < -12) {
          researchScrollIntent = 0;
        }
      }

      previousResearchScrollY = currentScrollY;
      researchTicking = false;
    };

    updateResearchCards();

    window.addEventListener(
      "scroll",
      () => {
        if (researchTicking) {
          return;
        }

        researchTicking = true;
        window.requestAnimationFrame(updateResearchCards);
      },
      { passive: true }
    );

    window.addEventListener(
      "resize",
      () => {
        previousResearchScrollY = window.scrollY;
        updateResearchCards();
      },
      { passive: true }
    );
  }
}

if (coreModules) {
  const moduleButtons = Array.from(
    coreModules.querySelectorAll("[data-module-tab]")
  );
  const modulePanel = coreModules.querySelector("[data-core-modules-panel]");
  const moduleKicker = coreModules.querySelector("[data-core-modules-kicker]");
  const moduleTitle = coreModules.querySelector("[data-core-modules-title]");
  const moduleDescription = coreModules.querySelector(
    "[data-core-modules-description]"
  );
  const moduleScreens = coreModules.querySelector("[data-core-modules-screens]");

  const coreModuleData = {
    dashboard: {
      index: "01",
      name: "Assign",
      description:
        "Create and manage classwork.",
      screens: [
        {
          title: "Recipient selection",
          body:
            "This step helps teachers quickly decide who should receive the assignment without adding unnecessary complexity.",
          points: [
            "<strong>Flexible targeting</strong> Teachers can choose between sending homework to the entire class or selecting specific students, supporting both common and edge-case scenarios.",
            "<strong>Reduced decision friction</strong> The default selection is set to &ldquo;Entire Class,&rdquo; aligning with the most frequent use case and minimizing extra effort.",
            "<strong>Clear visual selection</strong> Card-based class selection with strong visual states makes it easy to identify the active choice at a glance.",
          ],
          src: "./assets/homepage-collapsable-step-v4.png",
          alt: "Assignment recipient selection screen with class and student targeting options.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
        },
        {
          title: "Subject selection",
          body:
            "This step helps teachers quickly choose the relevant subject while keeping the flow focused and distraction-free.",
          points: [
            "<strong>Focused choices</strong> Subjects appear in a simple, scannable list",
            "<strong>Faster decisions</strong> Book counts add useful context",
            "<strong>Low distraction</strong> One clear task and one clear next step",
          ],
          src: "./assets/select-subject-step-v1.png",
          alt: "Assignment subject selection screen with clear subject options.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
        },
        {
          title: "Book selection",
          body:
            "This step helps teachers choose the right textbook quickly while still seeing enough detail to decide with confidence.",
          points: [
            "<strong>Rich preview</strong> Chapters, questions, and videos surface upfront",
            "<strong>Easy comparison</strong> Covers and metadata support fast scanning",
            "<strong>Flexible selection</strong> Multiple books can be chosen when needed",
          ],
          src: "./assets/select-book-step-v1.png",
          alt: "Assignment book selection screen with textbook cards and multi-select checkboxes.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
        },
        {
          title: "Chapter and topic selection",
          body:
            "This step focuses on helping teachers quickly select relevant chapters and topics for the assignment while keeping the experience structured and easy to navigate.",
          points: [
            "<strong>Hierarchical selection</strong> Chapters act as parent groups with expandable topics",
            "<strong>Granular control</strong> Select entire chapters or specific topics",
            "<strong>Clear content visibility</strong> Question and video counts show content depth",
            "<strong>Efficient multi-selection</strong> Checkboxes support broader assignments quickly",
          ],
          src: "./assets/select-topic-step-v1.png",
          alt: "Assignment chapter and topic selection screen with expandable chapters and topic checkboxes.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
        },
        {
          title: "Activity selection",
          body:
            "This step focuses on helping teachers choose the right learning format for the assignment based on their teaching intent.",
          points: [
            "<strong>Intent-based choices</strong> Learn, Practice, and Learn &amp; Practice align with common teaching goals",
            "<strong>Clear differentiation</strong> Short descriptions and content indicators make options easy to compare",
            "<strong>Guided selection</strong> Learn &amp; Practice is pre-selected while other formats stay available",
            "<strong>Minimal decision effort</strong> Radio selection keeps the interaction simple and focused",
          ],
          src: "./assets/select-activity-step-v2.png",
          alt: "Assignment activity selection screen with Learn, Practice, and Learn and Practice options.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
        },
        {
          title: "Video selection",
          body:
            "This step focuses on helping teachers quickly choose relevant learning videos, making it easy to build engaging, content-driven assignments.",
          points: [
            "<strong>Content-first browsing</strong> Thumbnails, titles, and duration make videos easy to scan",
            "<strong>Easy multi-selection</strong> Checkboxes let teachers pick multiple videos in one pass",
            "<strong>Clear context cues</strong> Duration and previews help assess relevance without opening each video",
          ],
          src: "./assets/select-videos-step-v1.png",
          alt: "Assignment video selection screen with video thumbnails, durations, and multi-select checkboxes.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
        },
        {
          title: "Question selection",
          body:
            "This step focuses on helping teachers quickly choose relevant practice questions, enabling them to build assignments that effectively test student understanding.",
          points: [
            "<strong>Structured question overview</strong> Each question is presented with key metadata like type, marks, and difficulty, helping teachers assess suitability at a glance",
            "<strong>Easy multi-selection</strong> Checkbox-based interaction allows selecting multiple questions, supporting comprehensive and varied practice sets",
            "<strong>Progressive content reveal</strong> A short preview keeps the list scannable, while &ldquo;Read full question&rdquo; lets teachers access complete details when needed",
            "<strong>Balanced difficulty selection</strong> Clear difficulty tags help teachers mix question levels, creating more effective and well-rounded assignments",
          ],
          src: "./assets/select-questions-step-v1.png",
          alt: "Assignment question selection screen with practice question cards, metadata tags, and multi-select checkboxes.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
        },
        {
          title: "Preview assignment",
          body:
            "This step focuses on giving teachers a complete overview of the homework before sending it, helping them review and confirm all details with confidence.",
          points: [
            "<strong>Consolidated summary</strong> Key details like recipients, subject, and delivery time are grouped together, making it easy to verify important information at a glance",
            "<strong>Clear content preview</strong> Learning videos and practice questions are displayed in a structured format, allowing teachers to quickly review what students will receive",
            "<strong>Edit-friendly structure</strong> Each section is accessible and editable, enabling quick adjustments without restarting the flow",
            "<strong>Confidence before action</strong> A final review step reduces errors and ensures the assignment aligns with the teacher&rsquo;s intent",
          ],
          src: "./assets/preview-assignment-step-v1.png",
          alt: "Assignment preview screen with recipients, subject, delivery time, videos, and practice questions grouped for review.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
        },
        {
          title: "Assignment confirmation",
          visual: "success",
          alt: "Assignment success screen with an animated confirmation check and a bold homework assigned successfully message.",
          tone: "light",
          presentation: "mobile",
          variant: "success",
          copyHidden: true,
          position: "50% 0%",
          scale: "1",
        },
      ],
    },
    attendance: {
      index: "02",
      kicker: "Attendance",
      name: "Attendance",
      description:
        "Mark, track, and review presence.",
      screens: [
        {
          title: "Attendance management",
          body:
            "This screen is designed to help teachers quickly manage daily attendance while keeping important actions and insights easily accessible in one place.",
          points: [
            "<strong>Quick action for attendance marking</strong> A prominent &ldquo;Mark Attendance&rdquo; card allows teachers to start marking present, absent, or late students instantly, reducing friction in a routine task",
            "<strong>Actionable alerts</strong> Pending leave requests are surfaced clearly with visual indicators, helping teachers review and approve them without missing important updates",
            "<strong>At-a-glance insights</strong> Key attendance metrics like monthly percentage, trends, and top-performing students provide quick visibility into overall classroom attendance",
            "<strong>Contextual class control</strong> The ability to switch classes from the top ensures teachers can easily manage attendance across multiple sections",
            "<strong>Seamless navigation</strong> Clear sections and structured layout guide teachers through actions, tasks, and insights without overwhelming the interface",
          ],
          src: "./assets/attendance-management-step-v3.png",
          alt: "Attendance tools screen showing class switching, a mark attendance quick action, leave request alerts, and attendance insights.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
          width: "17.4rem",
        },
        {
          title: "Mark attendance",
          body:
            "This screen is designed to help teachers quickly mark student attendance in a single, streamlined view while maintaining clarity and control over the process.",
          points: [
            "<strong>Quick status marking</strong> Each student can be marked as present, absent, or late with one-tap actions, enabling fast updates across the entire class",
            "<strong>Clear visual feedback</strong> Distinct color-coded states make it easy to identify attendance status at a glance, reducing chances of error",
            "<strong>Bulk action support</strong> The &ldquo;Mark all present&rdquo; option speeds up the process for common scenarios, minimizing repetitive effort",
            "<strong>Real-time progress tracking</strong> A live counter shows how many students have been marked, helping teachers ensure completion before submission",
          ],
          src: "./assets/attendance-mark-step-v1.png",
          alt: "Mark attendance screen showing a class roster, one-tap present absent and late controls, a mark all present shortcut, and a live marked counter.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
          width: "17.4rem",
        },
        {
          title: "Confirming attendance submission",
          body:
            "A final review dialog that helps teachers verify attendance details before submitting, reducing errors in a critical daily task.",
          points: [
            "<strong>Clear summary</strong> Displays total students along with present, absent, and late counts for quick validation",
            "<strong>Visual clarity</strong> Color-coded indicators make it easy to scan and confirm attendance distribution at a glance",
            "<strong>Error prevention</strong> Gives teachers a chance to review and go back before final submission",
            "<strong>Confident action</strong> Clear &ldquo;Go back&rdquo; and &ldquo;Submit&rdquo; actions ensure control and clarity in the final step",
          ],
          src: "./assets/attendance-confirm-step-v2.png",
          alt: "Attendance submission confirmation dialog showing total student count, present absent and late summary, and go back and submit actions.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
          width: "17.1rem",
        },
        {
          title: "Managing leave requests",
          body:
            "A dedicated view that helps teachers review and act on student leave applications quickly without interrupting their workflow.",
          points: [
            "<strong>Structured request view</strong> Each request is presented with student details, duration, and reason for quick understanding",
            "<strong>Clear status navigation</strong> Tabs for pending, approved, and rejected requests help organize and track decisions efficiently",
            "<strong>Quick decision making</strong> Inline &ldquo;Approve&rdquo; and &ldquo;Reject&rdquo; actions enable teachers to respond instantly without additional steps",
            "<strong>Reduced cognitive load</strong> Clean card layout keeps information scannable, making it easier to process multiple requests",
            "<strong>Seamless workflow integration</strong> Keeps leave management within the attendance flow, avoiding the need to switch contexts",
          ],
          src: "./assets/attendance-leave-requests-step-v1.png",
          alt: "Leave requests screen showing pending approved and rejected tabs, student leave cards, and inline reject and approve actions.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
          width: "17.2rem",
        },
        {
          title: "Leave request states",
          body: [
            "The leave request flow includes two confirmation states&mdash;approval and rejection&mdash;so teachers can make decisions with the right level of context before notifying parents.",
            "<strong>Approval state</strong> When approving a request, the dialog shows the student details, leave duration, and reason for absence, allowing teachers to quickly verify the request before confirming. The action is kept simple with a clear &ldquo;Approve&rdquo; button, since no additional input is required.",
            "<strong>Rejection state</strong> When rejecting a request, the dialog includes the same request context but adds an optional reason field. This gives teachers the flexibility to explain the decision before notifying parents, making the rejection flow more thoughtful and transparent.",
          ],
          src: "./assets/attendance-leave-states-step-v3.mp4",
          alt: "Leave request approval and rejection confirmation states shown as a phone recording with contextual request details and decision dialogs.",
          tone: "light",
          presentation: "mobile",
          mediaType: "video",
          position: "50% 0%",
          scale: "1",
          width: "17.2rem",
        },
        {
          title: "Turning attendance into actionable insights",
          body:
            "This screen helps teachers go beyond marking attendance by highlighting key patterns, trends, and students who need attention.",
          points: [
            "<strong>Quick overview</strong> Monthly attendance and comparison with last month provide a quick performance snapshot",
            "<strong>Needs attention</strong> Low-attendance students are clearly highlighted for timely action",
            "<strong>Pattern recognition</strong> Day-wise trends reveal when absences occur most",
            "<strong>Actionable insights</strong> Built-in observations guide better decision-making",
            "<strong>Trend tracking</strong> A 6-month view shows how attendance evolves over time",
          ],
          src: "./assets/attendance-insights-step-v1.png",
          alt: "Attendance insights screen showing monthly attendance metrics, students needing attention, day-wise absence patterns, observations, and a six month trend view.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
          width: "27.8rem",
          figureColumnWidth: "minmax(19rem, 30.5rem)",
          copyWidth: "22.5rem",
        },
      ],
    },
    assignments: {
      index: "03",
      name: "Communicate",
      description:
        "Share updates and stay connected.",
      screens: [
        {
          title: "Communication hub",
          body:
            "This screen brings key communication tasks into one place, helping teachers send updates, access student information, and share learning resources without switching contexts.",
          points: [
            "<strong>Centralized actions</strong> Announcements, student directory, performance reports, and study material are grouped together for quick access",
            "<strong>Clear task discovery</strong> Each option is shown as a simple card with an icon, title, and short description for easy scanning",
            "<strong>Reduced workflow friction</strong> Common communication tasks are surfaced upfront, helping teachers move faster through routine actions",
            "<strong>Better connectivity</strong> The hub supports smoother communication with both students and parents from one place",
          ],
          src: "./assets/communication-hub-step-v1.png",
          alt: "Communication hub screen showing create announcement, students directory, performance reports, and share study material actions.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
          width: "17.6rem",
        },
        {
          title: "Creating announcements with ease",
          body:
            "This flow helps teachers quickly start creating announcements by offering flexible entry points based on their needs.",
          points: [
            "<strong>Flexible creation paths</strong> Teachers can start from scratch or choose from pre-made templates, supporting both custom and quick communication",
            "<strong>Reduced effort</strong> Templates help speed up the process, especially for frequently used announcements",
            "<strong>Clear decision point</strong> A simple bottom sheet keeps the choice focused without overwhelming the user",
          ],
          src: "./assets/communication-create-announcement-step-v1.png",
          alt: "Communication screen with a create announcement bottom sheet offering custom announcement and template creation paths.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
          width: "17.6rem",
        },
        {
          title: "Selecting recipients for announcements",
          body:
            "This step helps teachers choose who should receive the announcement, keeping the process flexible while easy to navigate.",
          points: [
            "<strong>Flexible targeting</strong> Teachers can send announcements to the entire class or select specific students based on the need",
            "<strong>Granular selection</strong> Student-level selection allows more precise communication when required",
            "<strong>Clear organization</strong> Class filters help teachers quickly narrow down and find relevant students",
            "<strong>Efficient selection</strong> Checkbox-based interaction enables quick multi-selection without extra steps",
          ],
          src: "./assets/communication-select-recipients-step-v1.png",
          alt: "Announcement recipient selection screen showing entire class and select students options, class filters, and checkbox-based student selection.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
          width: "17.6rem",
        },
        {
          title: "Choosing the right template",
          body:
            "This step helps teachers quickly select a pre-defined announcement format, making communication faster and more structured.",
          points: [
            "<strong>Pre-built templates</strong> Common use cases like meetings, exams, and holidays are available as ready-to-use templates",
            "<strong>Faster creation</strong> Templates reduce the effort required to draft announcements from scratch",
            "<strong>Clear categorization</strong> Tags like Events, Academic, and Finance help teachers quickly identify relevant templates",
            "<strong>Easy selection</strong> A simple list layout makes browsing and choosing templates quick and intuitive",
          ],
          src: "./assets/communication-templates-step-v2.png",
          alt: "Announcement template selection screen showing smart templates for meetings exams holidays and fee reminders with category tags.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
          width: "17.6rem",
        },
        {
          title: "Finalizing announcement content",
          body:
            "This step allows teachers to review and refine both the title and message before sending, ensuring clarity and accuracy.",
          points: [
            "<strong>Quick edit access</strong> Inline &ldquo;Edit&rdquo; actions for both title and message make it easy to update content without navigating away",
            "<strong>Pre-filled clarity</strong> Templates provide a structured starting point, reducing effort while maintaining consistency",
            "<strong>Flexible customization</strong> Teachers can adjust both heading and message to fit specific communication needs",
            "<strong>Enhanced communication</strong> Options to add images, documents, or links support richer and more informative announcements",
          ],
          src: "./assets/communication-details-step-v2.png",
          alt: "Announcement content finalization screen showing editable title and message fields plus options to add images documents or links.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
          width: "17.6rem",
        },
        {
          title: "Controlling when to send announcements",
          body:
            "This step allows teachers to decide whether to send announcements instantly or schedule them for later.",
          points: [
            "<strong>Flexible timing options</strong> Teachers can choose between immediate sending or scheduling for a specific date and time",
            "<strong>Planned communication</strong> Scheduling helps align announcements with relevant timings, improving effectiveness",
            "<strong>Simple date-time selection</strong> Clear inputs for date and time make scheduling quick and intuitive",
            "<strong>Reduced errors</strong> Explicit selection ensures announcements are sent at the intended time",
          ],
          src: "./assets/communication-send-options-step-v1.png",
          alt: "Announcement send options screen showing send now and schedule for later choices with date and time inputs.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
          width: "17.6rem",
        },
        {
          title: "Reviewing before sending",
          body:
            "This step allows teachers to verify the announcement as recipients will see it, ensuring everything is accurate before sending.",
          points: [
            "<strong>Real preview</strong> Displays the final message format for a clear understanding of how it will appear",
            "<strong>Complete overview</strong> Shows recipients, delivery time, and template for quick validation",
            "<strong>Error prevention</strong> A warning highlights that announcements cannot be edited once sent",
            "<strong>Quick edits</strong> An &ldquo;Edit&rdquo; option allows changes without restarting the flow",
          ],
          src: "./assets/communication-preview-step-v1.png",
          alt: "Announcement preview screen showing the final recipient-facing message, delivery details, warning notice, confirm and send action, and edit option.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
          width: "17.6rem",
        },
        {
          title: "Announcement confirmation",
          visual: "success",
          alt: "Announcement success screen with an animated confirmation check and a bold announcement sent successfully message.",
          tone: "light",
          presentation: "mobile",
          variant: "success",
          copyHidden: true,
          successLines: ["Announcement sent", "successfully"],
          position: "50% 0%",
          scale: "1",
        },
      ],
    },
    communication: {
      index: "04",
      name: "Performance Tracking",
      description: "Monitor student progress and outcomes over time.",
      screens: [
        {
          title: "Performance overview",
          body:
            "This screen helps teachers quickly understand how the class is performing overall and identify students who may need attention.",
          points: [
            "<strong>At-a-glance distribution</strong> A clear breakdown of performance levels (Excellent, Good, Average, Needs Improvement) allows teachers to instantly gauge class health without going through individual data.",
            "<strong>Quick student identification</strong> The student list surfaces individual scores along with status tags like &ldquo;On Track,&rdquo; &ldquo;Most Improved,&rdquo; and &ldquo;Needs Attention,&rdquo; making it easy to spot patterns and outliers.",
            "<strong>Time-based filtering</strong> Week, Month, and Year views enable teachers to track performance trends over time and switch context based on their need.",
            "<strong>Reduced scanning effort</strong> Search and filter options help teachers quickly find specific students, minimizing effort in larger classrooms.",
            "<strong>Clear visual hierarchy</strong> Grouping insights into distribution and individual performance ensures teachers can move from a high-level overview to specific students seamlessly.",
          ],
          src: "./assets/performance-insights-screen.png",
          alt: "Performance insights screen showing class switching, time filters, performance distribution, and a student performance list with status tags.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
          width: "17.8rem",
        },
        {
          title: "Student deep dive",
          body:
            "This screen helps teachers understand an individual student&rsquo;s performance in detail, enabling better diagnosis and informed action.",
          points: [
            "<strong>Holistic performance snapshot</strong> Key metrics like attendance, average score, and submissions provide a quick overview of the student&rsquo;s overall standing.",
            "<strong>Actionable insights</strong> The &ldquo;What you should know&rdquo; section highlights important patterns such as improvement trends, absentee behaviour, and strong/weak subjects, reducing the need for manual analysis.",
            "<strong>Trend visibility</strong> Attendance and test score trends over time help teachers identify consistency, drops, or improvements in performance.",
            "<strong>Subject-level breakdown</strong> Clear subject-wise performance allows teachers to pinpoint specific areas where the student excels or needs support.",
            "<strong>Activity tracking</strong> Recent homework and test sections show completion status (Submitted, Pending, Evaluated), helping track engagement and discipline.",
            "<strong>Reduced cognitive load</strong> Information is structured in progressive layers&mdash;from summary to detailed insights&mdash;making it easy to scan and interpret.",
            "<strong>Clear next steps</strong> Options to share or download reports enable teachers to take immediate action, whether for parent communication or internal tracking.",
          ],
          src: "./assets/student-deep-dive-screen.png",
          alt: "Student deep dive screen showing performance summary cards, insight notes, attendance and test trends, subject performance, recent homework, recent tests, and report actions.",
          tone: "light",
          presentation: "mobile",
          position: "50% 0%",
          scale: "1",
          width: "17.8rem",
        },
      ],
    },
  };

  if (
    moduleButtons.length &&
    modulePanel &&
    moduleKicker &&
    moduleTitle &&
    moduleDescription &&
    moduleScreens
  ) {
    let activeModuleId =
      moduleButtons.find((button) => button.classList.contains("is-active"))
        ?.dataset.moduleTab || moduleButtons[0].dataset.moduleTab;
    let moduleSwitchTimer = 0;
    let moduleStepObserver = null;

    const formatStepNumber = (value) => String(value).padStart(2, "0");

    const renderSuccessScreenMarkup = (screen = {}) => `
      <div class="case-doc-modules__success-screen" aria-hidden="true">
        <span class="case-doc-modules__success-spark case-doc-modules__success-spark--one"></span>
        <span class="case-doc-modules__success-spark case-doc-modules__success-spark--two"></span>
        <span class="case-doc-modules__success-spark case-doc-modules__success-spark--three"></span>
        <div class="case-doc-modules__success-device">
          <div class="case-doc-modules__success-check-wrap">
            <span class="case-doc-modules__success-ring case-doc-modules__success-ring--outer"></span>
            <span class="case-doc-modules__success-ring case-doc-modules__success-ring--middle"></span>
            <span class="case-doc-modules__success-ring case-doc-modules__success-ring--inner"></span>
            <span class="case-doc-modules__success-check">
              <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
                <path d="M11 20.5l6 6L29 14.5" />
              </svg>
            </span>
          </div>
          <h6>
            <span>${screen.successLines?.[0] || "Homework assigned"}</span>
            <span>${screen.successLines?.[1] || "successfully"}</span>
          </h6>
        </div>
      </div>
    `;

    const renderScreenFigure = (screen) => {
      const figureClasses = [
        "case-doc-modules__screen-figure",
        `case-doc-modules__screen-figure--${screen.tone}`,
        screen.presentation
          ? `case-doc-modules__screen-figure--${screen.presentation}`
          : "",
        screen.variant ? `case-doc-modules__screen-figure--${screen.variant}` : "",
      ]
        .filter(Boolean)
        .join(" ");

      const accessibilityAttributes =
        screen.visual === "success" || screen.mediaType === "video"
          ? ` role="img" aria-label="${screen.alt}"`
          : "";

      const content =
        screen.visual === "success"
        ? renderSuccessScreenMarkup(screen)
        : screen.mediaType === "video"
            ? `
                <video
                  class="case-doc-modules__screen-image case-doc-modules__screen-video"
                  src="${screen.src}"
                  autoplay
                  muted
                  loop
                  playsinline
                  preload="metadata"
                  aria-hidden="true"
                ></video>
              `
          : `
                <img
                  class="case-doc-modules__screen-image"
                  src="${screen.src}"
                  alt="${screen.alt}"
                  loading="lazy"
                />
              `;

      return `
              <figure
                class="${figureClasses}"${accessibilityAttributes}
                style="--screen-position: ${screen.position}; --screen-scale: ${screen.scale}; --screen-width: ${screen.width || "18.5rem"};"
              >
                ${content}
              </figure>
            `;
    };

    const renderScreens = (screens) =>
      screens
        .map(
          (screen, index) => `
            <article class="case-doc-modules__step is-pending${
              screen.copyHidden ? " case-doc-modules__step--visual-only" : ""
            }" data-module-step${
              screen.figureColumnWidth
                ? ` style="--step-media-column: ${screen.figureColumnWidth};"`
                : ""
            }>
              ${renderScreenFigure(screen)}
              ${
                screen.copyHidden
                  ? ""
                  : `
              <div class="case-doc-modules__step-copy"${
                screen.copyWidth
                  ? ` style="--copy-width: ${screen.copyWidth};"`
                  : ""
              }>
                <span class="case-doc-modules__step-label">STEP ${formatStepNumber(
                  index + 1
                )}</span>
                <h5>${screen.title}</h5>
                ${Array.isArray(screen.body)
                  ? screen.body.map((paragraph) => `<p>${paragraph}</p>`).join("")
                  : `<p>${screen.body}</p>`}
                ${
                  screen.points?.length
                    ? `
                <ul class="case-doc-modules__step-points">
                  ${screen.points
                    .map((point) => `<li>${point}</li>`)
                    .join("")}
                </ul>`
                    : ""
                }
              </div>`
              }
            </article>
          `
        )
        .join("");

    const setupModuleStepAnimations = () => {
      const steps = Array.from(
        moduleScreens.querySelectorAll("[data-module-step]")
      );

      moduleStepObserver?.disconnect();
      moduleStepObserver = null;

      if (!steps.length) {
        return;
      }

      if (reducedMotion || !("IntersectionObserver" in window)) {
        steps.forEach((step) => {
          step.classList.remove("is-pending");
          step.classList.add("is-visible");
        });
        return;
      }

      moduleStepObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.remove("is-pending");
              entry.target.classList.add("is-visible");
              moduleStepObserver?.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.18,
          rootMargin: "0px 0px -8% 0px",
        }
      );

      steps.forEach((step) => moduleStepObserver?.observe(step));
    };

    const syncModuleButtons = (moduleId) => {
      moduleButtons.forEach((button) => {
        const isActive = button.dataset.moduleTab === moduleId;

        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
        button.tabIndex = isActive ? 0 : -1;
      });
    };

    const commitModule = (moduleId) => {
      const moduleData = coreModuleData[moduleId];

      if (!moduleData) {
        return;
      }

      moduleKicker.textContent = moduleData.kicker || "Assignment";
      moduleTitle.textContent = moduleData.name;
      moduleDescription.textContent = moduleData.description;
      moduleScreens.innerHTML = renderScreens(moduleData.screens);
      setupModuleStepAnimations();
      modulePanel.setAttribute(
        "aria-labelledby",
        `core-module-tab-${moduleId}`
      );
      syncModuleButtons(moduleId);
      activeModuleId = moduleId;
    };

    const switchModule = (moduleId, { instant = false } = {}) => {
      if (!coreModuleData[moduleId] || moduleId === activeModuleId) {
        return;
      }

      syncModuleButtons(moduleId);

      if (instant || reducedMotion) {
        commitModule(moduleId);
        return;
      }

      window.clearTimeout(moduleSwitchTimer);
      modulePanel.classList.add("is-switching");

      moduleSwitchTimer = window.setTimeout(() => {
        commitModule(moduleId);
        window.requestAnimationFrame(() => {
          modulePanel.classList.remove("is-switching");
        });
      }, 150);
    };

    moduleButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        switchModule(button.dataset.moduleTab);
      });

      button.addEventListener("keydown", (event) => {
        const lastIndex = moduleButtons.length - 1;
        let nextIndex = index;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIndex = index === lastIndex ? 0 : index + 1;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIndex = index === 0 ? lastIndex : index - 1;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = lastIndex;
        } else {
          return;
        }

        event.preventDefault();
        moduleButtons[nextIndex].focus();
        switchModule(moduleButtons[nextIndex].dataset.moduleTab);
      });
    });

    commitModule(activeModuleId);
  }
}

if (!reducedMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (offGridCarousel) {
  const track = offGridCarousel.querySelector(".off-grid__track");
  const originalCards = track
    ? Array.from(track.querySelectorAll(".off-grid-card"))
    : [];
  const shouldAutoAnimate = Boolean(
    track && originalCards.length > 1 && !reducedMotion
  );

  if (shouldAutoAnimate) {
    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);

      clone.classList.remove("is-active");
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
  }

  const cards = Array.from(offGridCarousel.querySelectorAll(".off-grid-card"));
  let offGridTicking = false;
  let loopWidth = 0;
  let pauseUntil = 0;
  let pointerPaused = false;
  let carouselInView = false;
  let offGridAnimationFrame = 0;
  let animateOffGrid = null;
  let lastAutoTime = performance.now();
  const autoScrollSpeed = 0.055;

  const measureLoop = () => {
    if (!track || !shouldAutoAnimate) {
      loopWidth = 0;
      return;
    }

    const firstClone = track.querySelector('.off-grid-card[aria-hidden="true"]');
    loopWidth = firstClone
      ? firstClone.offsetLeft - track.offsetLeft
      : track.scrollWidth / 2;
  };

  const normalizeLoop = () => {
    if (!loopWidth) {
      return;
    }

    if (offGridCarousel.scrollLeft >= loopWidth) {
      offGridCarousel.scrollLeft -= loopWidth;
    } else if (offGridCarousel.scrollLeft < 0) {
      offGridCarousel.scrollLeft += loopWidth;
    }
  };

  const updateOffGridActive = () => {
    normalizeLoop();

    const center =
      offGridCarousel.scrollLeft + offGridCarousel.clientWidth / 2;

    let activeCard = cards[0];
    let smallestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - center);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        activeCard = card;
      }
    });

    cards.forEach((card) => {
      card.classList.toggle("is-active", card === activeCard);
    });
  };

  const requestOffGridUpdate = () => {
    if (offGridTicking) {
      return;
    }

    offGridTicking = true;
    window.requestAnimationFrame(() => {
      updateOffGridActive();
      offGridTicking = false;
    });
  };

  const pauseBriefly = (duration = 1800) => {
    pauseUntil = performance.now() + duration;
  };

  measureLoop();
  updateOffGridActive();
  offGridCarousel.addEventListener("scroll", requestOffGridUpdate, {
    passive: true,
  });

  if ("IntersectionObserver" in window) {
    const carouselObserver = new IntersectionObserver(
      (entries) => {
        carouselInView = entries.some((entry) => entry.isIntersecting);
        lastAutoTime = performance.now();

        if (carouselInView) {
          requestOffGridUpdate();
          if (shouldAutoAnimate && animateOffGrid && !offGridAnimationFrame) {
            lastAutoTime = performance.now();
            offGridAnimationFrame = window.requestAnimationFrame(animateOffGrid);
          }
        } else if (offGridAnimationFrame) {
          window.cancelAnimationFrame(offGridAnimationFrame);
          offGridAnimationFrame = 0;
        }
      },
      { rootMargin: "160px 0px", threshold: 0.01 }
    );

    carouselObserver.observe(offGridCarousel);
  } else {
    carouselInView = true;
  }

  window.addEventListener("resize", () => {
    measureLoop();
    requestOffGridUpdate();
  });

  offGridCarousel.addEventListener(
    "mouseenter",
    () => {
      pointerPaused = true;
    },
    { passive: true }
  );

  offGridCarousel.addEventListener(
    "mouseleave",
    () => {
      pointerPaused = false;
      pauseBriefly(500);
    },
    { passive: true }
  );

  offGridCarousel.addEventListener("focusin", () => {
    pointerPaused = true;
  });

  offGridCarousel.addEventListener("focusout", () => {
    pointerPaused = false;
    pauseBriefly(500);
  });

  offGridCarousel.addEventListener(
    "pointerdown",
    () => {
      pointerPaused = true;
    },
    { passive: true }
  );

  window.addEventListener(
    "pointerup",
    () => {
      pointerPaused = false;
      pauseBriefly(900);
    },
    { passive: true }
  );

  window.addEventListener(
    "pointercancel",
    () => {
      pointerPaused = false;
      pauseBriefly(900);
    },
    { passive: true }
  );

  offGridCarousel.addEventListener(
    "touchstart",
    () => {
      pointerPaused = true;
      pauseBriefly(1800);
    },
    { passive: true }
  );

  offGridCarousel.addEventListener(
    "touchend",
    () => {
      pointerPaused = false;
      pauseBriefly(900);
    },
    { passive: true }
  );

  offGridCarousel.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      if (offGridCarousel.scrollWidth <= offGridCarousel.clientWidth) {
        return;
      }

      event.preventDefault();
      pauseBriefly();
      offGridCarousel.scrollLeft += event.deltaY;
      normalizeLoop();
      requestOffGridUpdate();
    },
    { passive: false }
  );

  if (shouldAutoAnimate) {
    animateOffGrid = (now) => {
      offGridAnimationFrame = 0;

      if (!carouselInView || document.hidden) {
        return;
      }

      const delta = Math.min(now - lastAutoTime, 48);
      const hasFocus =
        document.activeElement && offGridCarousel.contains(document.activeElement);
      const isPaused =
        !carouselInView ||
        pointerPaused ||
        hasFocus ||
        pauseUntil > now ||
        document.hidden;

      lastAutoTime = now;

      if (
        !isPaused &&
        loopWidth &&
        offGridCarousel.scrollWidth > offGridCarousel.clientWidth
      ) {
        offGridCarousel.scrollLeft += delta * autoScrollSpeed;
        normalizeLoop();
        requestOffGridUpdate();
      }

      offGridAnimationFrame = window.requestAnimationFrame(animateOffGrid);
    };

    document.addEventListener("visibilitychange", () => {
      lastAutoTime = performance.now();

      if (document.hidden && offGridAnimationFrame) {
        window.cancelAnimationFrame(offGridAnimationFrame);
        offGridAnimationFrame = 0;
      } else if (carouselInView && !offGridAnimationFrame) {
        offGridAnimationFrame = window.requestAnimationFrame(animateOffGrid);
      }
    });

    if (carouselInView) {
      offGridAnimationFrame = window.requestAnimationFrame(animateOffGrid);
    }
  }
}

const supportsCustomCursor =
  Boolean(cursorDot && cursorRing) &&
  !reducedMotion &&
  window.matchMedia("(pointer: fine)").matches;

if (supportsCustomCursor) {
  document.documentElement.classList.add("has-custom-cursor");

  const root = document.documentElement;
  const interactiveSelector = [
    "a",
    "button",
    ".button",
    ".text-link",
    ".case-study__link",
    ".contact__links a",
  ].join(", ");

  let dotX = -100;
  let dotY = -100;
  let ringX = -100;
  let ringY = -100;

  const setHoverState = (target) => {
    const isInteractive = Boolean(target?.closest(interactiveSelector));
    cursorDot.classList.toggle("is-hover", isInteractive);
    cursorRing.classList.toggle("is-hover", isInteractive);
  };

  const renderCursor = () => {
    ringX += (dotX - ringX) * 0.18;
    ringY += (dotY - ringY) * 0.18;

    root.style.setProperty("--cursor-x", `${dotX}px`);
    root.style.setProperty("--cursor-y", `${dotY}px`);
    cursorRing.style.setProperty("--cursor-x", `${ringX}px`);
    cursorRing.style.setProperty("--cursor-y", `${ringY}px`);

    window.requestAnimationFrame(renderCursor);
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      dotX = event.clientX;
      dotY = event.clientY;

      cursorDot.classList.add("is-visible");
      cursorRing.classList.add("is-visible");
      setHoverState(event.target);
    },
    { passive: true }
  );

  window.addEventListener(
    "pointerdown",
    () => {
      cursorDot.classList.add("is-pressed");
      cursorRing.classList.add("is-pressed");
    },
    { passive: true }
  );

  window.addEventListener(
    "pointerup",
    () => {
      cursorDot.classList.remove("is-pressed");
      cursorRing.classList.remove("is-pressed");
    },
    { passive: true }
  );

  document.documentElement.addEventListener("mouseleave", () => {
    cursorDot.classList.remove("is-visible", "is-hover", "is-pressed");
    cursorRing.classList.remove("is-visible", "is-hover", "is-pressed");
  });

  document.documentElement.addEventListener("mouseenter", () => {
    cursorDot.classList.add("is-visible");
    cursorRing.classList.add("is-visible");
  });

  window.addEventListener("blur", () => {
    cursorDot.classList.remove("is-visible", "is-hover", "is-pressed");
    cursorRing.classList.remove("is-visible", "is-hover", "is-pressed");
  });

  renderCursor();
}
