## Inspiration

People love Uber, but they haven't abandoned the other transportations. This is because Uber might be optimal for in-city transportation, it is either too *slow* or too *expensive* to take between longer distances. 

### Examples

* **Uber + Caltrain**. A lot of people in the Bay Area commute to work. One of the increasingly popular patterns is uber-caltrain-uber. 
* **Uber + Flights**.


### A Large-Scale Problem We Solve

Can we **automate** and **simplify** the tedious process of itinerary planning and execution? 

## What it does

Hermes solves the raised problem by integrating Uber with long-distance transportation. 

* **End-to-End planning**. Users tell the app where to go and what is the time of departure. Hermes finds a route that combines long-distance transportation and Uber.

![](http://gdurl.com/hFAm)

* **Right on time**. Hermes estimates ETA of Uber driver, and make calls **in advance**. So the Uber driver will show up right on time.

* **Use app once for all**. Hermes uses current location and time to estimate progress. Based on the route, if the user is taking the public transportation and is about to arrive at the station, it makes Uber calls automatically. 


## How I built it

We wrote an iOS app with ionic framework. The app has a UI that overlays the control over a HERE maps. The client takes user input and through HERE maps API creates a route for the user. 

During the trip, a background thread keeps track of the time and user's GPS coordinates. And based on the routes and ETA estimates, it makes Uber calls at the right times. 

## Challenges I ran into

* It's a challenge to create a demo, because a complete real demo requires a long-distance trip.
* Using ionic framework with Uber and maps API is quite tricky.

## Accomplishments that I'm proud of

A reasonably good looking UI and a useful functionality. 

## What I learned

How to write a iOS app without xcode.

## What's next for Hermes - An end-to-end itinerary bot

* We plan to integrate Uber with flights. Use data to estimate the time to check out of airport, and arranges Uber to show on time.
* Build user preferences and trip costs into the app. So Hermes could find the route that maximizes user experiences.
* Put this to App Store and collect user feedbacks.

