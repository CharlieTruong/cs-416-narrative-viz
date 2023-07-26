## CS-416 Narrative Visualization Project

* Name: Charlie Truong
* Email: ctruong4@illinois.edu
* Github repo: [https://github.com/CharlieTruong/cs-416-narrative-viz](https://github.com/CharlieTruong/cs-416-narrative-viz)
* Visualization link: [https://charlietruong.github.io/cs-416-narrative-viz](https://charlietruong.github.io/cs-416-narrative-viz)

### Messaging

This narrative visualization project provides a high-level walkthrough of the covid-19 pandemic timeline in the U.S. It displays the new covid cases and deaths by week along with the cumulative number of people with at least one vaccination dose. The visualization aims to show that vaccines were critical to stabilizing the covid cases and deaths, allowing the U.S. to emerge from the pandemic.

### Narrative Structure

This visualization follows a martini glass narrative structure. There are four scenes with each scene representing a later period in the timeline. Each scene has an annotation in the timeseries chart that draws the user's attention to a specific point.

Before the final scene, the allowed user interaction is minimal. If the user hovers over the timeseries chart, then a tooltip is displayed showing the nearest date's data values.

The final scene shows a map of the U.S. that allows the user to click on a specific state and filter the timeseries chart to the specific state. So, the user can then explore each state's covid data in any order they wish.

### Visual Structure

Each scene progressively displays more of the pandemic timeline. From the beginning, the entire date range is shown on the x-axis but only a portion of the data is shown up until the scene's annotation. The annotation aims to highlight the key point of the scene to the user. On each scene change, the previous scene's annotation is removed because it is no longer relevant.

The visualization helps the viewer transition between scenes by maintaining the full timeline date range on the timeseries x-axis and appending newer data between scenes. This allows it to clearly communicate to the user where they are in the timeline with each scene change.

In the final scene, the user is allowed to filter on a specific state using a map of the U.S. If the user clicks on a state, then the state is highlighted with a darker color and the time series chart title is updated to callout to the user that the data is filtered to that particular state.

### Scenes

There are four scenes in chronological order to walk the user through the covid-19 timeline. Each scene has an annotation to raise a specific point to the user.

* Scene 1: April 19, 2020 - the initial peak in covid deaths during the pandemic
* Scene 2: Jan 17, 2021 - The new peak in covid deaths as vaccinations start in Dec 2020
* Scene 3: Jan 16, 2022 - Covid cases surge but deaths are not similarly surging as more are vaccinated
* Scene 4: Mar 12, 2023 - The final date in the timeline where covid cases and deaths have stabilized

### Annotations

As mentioned, each scene has one annotation to draw the user's attention to key points in the data. Each of the annotations points to a specific data point using an arrow with a callout that contains the data point's date as the callout title followed by smaller text description. This template was selected to better call attention to relevant sections of the data in the timeline.

Originally, it was considered to show more key timeline events, but the chart quickly became cluttered. So, the number of annotations was significantly reduced to have the user focus on just a few key points.

The annotations do not change within a single scene to keep the user focused on the scene's specific purpose. The annotations support the overall messaging by highlighting spikes in the number of deaths early on but as vaccinations increased, then covid cases and deaths stabilized.

### Parameters

The key parameters in the narrative visualization are the scene or slide number as well as whether the data should be filtered on a specific U.S. state. The U.S. state filtering only applies to the final scene.

Each scene number controls the maximum date up to which the time series data is displayed. Additionally, the latest date in the scene also has a specific annotation defined for it.

* Scene 1
    * max date: April 19, 2020
* Scene 2
    * max date: Jan 17, 2021
* Scene 3
    * max date: Jan 16, 2022
* Scene 4
    * max date: Mar 12, 2023
    * state: Optional U.S. state to filter on the data

The final scene will also display a map of the U.S. showing total covid deaths by state. If a user filters the data by a particular state, then all the other states have their fill color removed from the map.

### Triggers

The triggers are scene numbers that govern the specific scene or part of the timeline to display. The scene numbers are displayed in order from "1" to "4", intending for the user to click them in order. The active scene has more opacity than the inactive scenes.

In the final scene, a map of the U.S. is displayed. The title of the map clarifies for the user that clicking on a state will filter the data to the specific state. Additionally, on hover, the cursor is changed to a pointer to indicate a state can be clicked. Lastly, if the data is filtered by state, then a "Reset State Filter" button is displayed to allow the user to remove the filter.
