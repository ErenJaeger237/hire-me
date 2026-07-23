# Chapter 2: Literature Review and Methodology

## 2.1 Review of Related Literature
The evolution of freelance service marketplaces has been well-documented in recent software engineering and economic literature. Platforms like Upwork, Fiverr, and TaskRabbit have demonstrated the viability of connecting independent contractors with clients via centralized digital hubs. However, literature highlights several persistent pain points in these platforms, particularly regarding trust, quality assurance, and high commission fees. 

According to Smith et al. (2022) in their analysis of gig economy platforms, decentralized trust mechanisms—such as escrow services—are critical in mitigating fraud. The "Hire Me" platform addresses this directly by integrating a built-in virtual wallet and an escrow holding system, ensuring that funds are committed before work begins but not released until client satisfaction is confirmed. Furthermore, localized platforms face unique challenges related to real-time coordination, which "Hire Me" solves through integrated WebSocket-based chat and instant status updates, reducing the friction often cited in user experience studies of service marketplaces.

## 2.2 Software Development Methodologies
In software engineering, the choice of development methodology significantly impacts the project's success, adaptability, and time-to-market. The two primary paradigms considered for this project were the Waterfall model and Agile methodologies.

- **Waterfall Methodology:** A linear, sequential approach where each phase (Requirements, Design, Implementation, Testing, Deployment) must be completed before the next begins. While offering strict documentation and predictability, it lacks flexibility. If a critical flaw in the escrow logic was discovered during testing, revisiting the design phase would be highly disruptive.
- **Agile Methodology:** An iterative approach that promotes continuous delivery, flexible responses to change, and collaborative development. 

## 2.3 Justification for Choosing Scrum
For the development of the "Hire Me" platform, the **Scrum** framework—a specific subset of Agile—was selected. This decision was driven by several factors:
1. **Iterative Feature Delivery:** The platform required complex, interwoven features (e.g., authentication, wallet, real-time chat). Scrum allowed the team to break these down into manageable one-week Sprints, delivering a functional increment (like the core booking flow) before adding complexities (like the WebSocket chat).
2. **Rapid Adaptation:** As the team encountered technical challenges (such as the asynchronous complexities of managing escrow refunds during booking cancellations), Scrum's daily stand-ups and Sprint Retrospectives allowed for immediate pivoting and architecture adjustments without derailing the entire project timeline.
3. **Clear Role Distribution:** With a clear division of labor across frontend, backend, and documentation, the Scrum framework provided necessary structure. The Product Backlog ensured that all contributors remained aligned on priority tasks, preventing scope creep and ensuring that the MVP (Minimum Viable Product) was achieved efficiently.
