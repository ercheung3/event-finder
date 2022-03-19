# Event Palooza App
This out of this world app will let you find fun and upcoming events near your area!
**Created By: _Brevan Bender, Angela Francisco, Pierre Tulifau, Eric Cheung_**

## Hosted App Link
[Event Palooza App via Heroku](https://eventpalooza.herokuapp.com/events)

<!-- ### Preview of Eventpalooza -->
<!-- ![Screenshot preview of Eventpalooze](./public/img/Event%20Palooza%20User%20Flow.png) -->

## Technology Used
- HTML/CSS
- JavaScript


## Frameworks & Libraries
- MongoDB Atlas, Mongoose
- Node.js
- Express, EJS
- Bcrypt
- API Axios


## MVP 
* Users can search for local events based on their interests!.
* * User begins on the home page that renders all events and allows users to login/signup
* * User finds an event their interested in and renders the show page for the event.
* * If the user is not logged in, they are prompted to log in when saving event.
* * If user is also the creator of the event, they can edit or delete an event.
* * The user homepage sends a individualized greeting and displays all events they like.


## STRETCH GOALS
- CSS
    -- Flexbox/Grid Display
    -- Partials for head, header, footer
    -- Custom Logo
    -- Custom Favicon.io
- Event API using eventURL, starting location - Portland, OR. From [Ticketmaster API](https://developer.ticketmaster.com/products-and-docs/apis/getting-started/)
- Search functionality with keyword and date (saved events and api events)
    -- Name, Date, Event Tag
- Additional user functionality: save/unsave event button


## Future Features
* Responsive Mobile Design
* Multiple Locations (currently only in Portland)
* Ability for user to upload an image from file for a new event or when editing an event
* Additional event type: Age Restriction [0,21]
* Added save events to Google Calendar
* Ability for user to delete their account
* Ability for user to change password
* Fix user search functionality: works for saved events that were created by users, cannot currently display saved API events


## Models
Events
- name: String
- description : String
- image: String (url)
- date: Date (Format YYYY-MM-DDTHH:MM:SSZ)
- user: User (model)
- organization: String
- tag: String
    - Music/Concert
    - Community Event
    - Outdoor Recreation
    - Health/Fitness
- location: String
- likes: (Array (User.id))

Users
- username: String REQUIRED UNIQUE
- password: String REQUIRED
- displayname: String UNIQUE
- firstname: String
- lastname: String
- likes: (Arry (API_Objects ))


## User Flowchart

![User flowchart for even app](./public/img/Event%20Palooza%20User%20Flow.png)

<!-- ## Wireframing -->


## RESTful Routes
![Restful Route Chart](./public/img/RESTful_Routes-event_palooza.png)


## General Assembly Project Requirements

* A working full-stack application, built by you, using Node.js, Mongoose, Express and EJS
* Adhere to the MVC file structure: Models, Views, Controllers
* At least one non-User model with all 7 RESTful routes and full CRUD (Events model)
* A User model with functioning registration, log-in, and log-out abilities
* Your non-User model is connected to the User that created it (Events model)
* A git repository not inside the class repo (all team members are collaborators)
* At least one GitHub commit per day
* Be deployed online and accessible to the public via Heroku
* A README.md file


## Team Contributions
- Front-End Web Development: Angela, Pierre
- Back-End Web Development: Brevan, Eric