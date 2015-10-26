# Hermes (UberAutomator)

## Inspiration

People love Uber, but they haven't abandoned the other transportations. This is because Uber might be optimal for in-city transportation, it is either too *slow* or too *expensive* to take between longer distances. 

### Examples

* **Uber + Caltrain**. A lot of people in the Bay Area commute to work. One of the increasingly popular patterns is uber-caltrain-uber. 
* **Uber + Flights**.

### A Large-Scale Problem We Solve

Can we **automate** and **simplify** the tedious process of itinerary planning and execution? 

## What it does

* [Watch the demo video](demo/hermes1.mov)

Hermes solves the raised problem by integrating Uber with long-distance transportation. 

* **End-to-End planning**. Users tell the app where to go and what is the time of departure. Hermes finds a route that combines long-distance transportation and Uber.


* **Right on time**. Hermes estimates ETA of Uber driver, and make calls **in advance**. So the Uber driver will show up right on time.

* **Use app once for all**. Hermes uses current location and time to estimate progress. Based on the route, if the user is taking the public transportation and is about to arrive at the station, it makes Uber calls automatically. 


# How It Works

*Step 1:*
Enter the time you expect to depart and departure location (If it's your current location, just press the dot on the right side of the search bar).
<br>
<img src="https://scontent-sea1-1.xx.fbcdn.net/hphotos-xta1/v/t1.0-9/12065749_10205897934140518_6826414374368941204_n.jpg?oh=feca310a8471fa53681e056a896646ac&oe=56CF591E" width="300px" height="500px" position:block/>

*Step 2:* 
Enter your destination.
<br>
<img src="https://scontent-sea1-1.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/12074706_10205897935420550_4317076571724548989_n.jpg?oh=c4a80c6dd409401dc68648d3f9c81fc3&oe=56C7312C" width="300px" height="500px" />

*Step 3:*
Receive a route of your travels, with instructions to either take Uber or public transportation.
<br>
<img src="https://scontent-sea1-1.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/12088331_10205897935700557_6456150615236321784_n.jpg?oh=d3b17cd423144f5361203338088deec3&oe=568EF69D" width="300px" height="500px" />

<img src="https://scontent-sea1-1.xx.fbcdn.net/hphotos-xal1/v/t1.0-9/12122782_10205897936540578_6792278065757239659_n.jpg?oh=b0345723baec96e663bf4417fa32e370&oe=56C6CF99" width="300px" height="500px" />

*Step 4:*
Arrive at your destination.
<br>
<img src="https://scontent-sea1-1.xx.fbcdn.net/hphotos-xta1/v/t1.0-9/12141498_10205897936580579_3776848736196902761_n.jpg?oh=75fd142ede08835725120892966b2df2&oe=5687E9CD" width="300px" height="500px" />
