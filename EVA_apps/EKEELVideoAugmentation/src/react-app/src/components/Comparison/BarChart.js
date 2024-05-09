// install (please try to align the version of installed @nivo packages)
// yarn add @nivo/bar
import { ResponsiveBar } from '@nivo/bar'
import React from "react"

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const data = [
    {
      "country": "AD",
      "hot dog": 36,
      "hot dogColor": "hsl(78, 70%, 50%)",
      "burger": 124,
      "burgerColor": "hsl(272, 70%, 50%)",
      "sandwich": 100,
      "sandwichColor": "hsl(197, 70%, 50%)",
      "kebab": 147,
      "kebabColor": "hsl(357, 70%, 50%)",
      "fries": 199,
      "friesColor": "hsl(173, 70%, 50%)",
      "donut": 98,
      "donutColor": "hsl(198, 70%, 50%)"
    },
    {
      "country": "AE",
      "hot dog": 80,
      "hot dogColor": "hsl(354, 70%, 50%)",
      "burger": 29,
      "burgerColor": "hsl(19, 70%, 50%)",
      "sandwich": 188,
      "sandwichColor": "hsl(219, 70%, 50%)",
      "kebab": 159,
      "kebabColor": "hsl(283, 70%, 50%)",
      "fries": 55,
      "friesColor": "hsl(137, 70%, 50%)",
      "donut": 99,
      "donutColor": "hsl(46, 70%, 50%)"
    },
    {
      "country": "AF",
      "hot dog": 149,
      "hot dogColor": "hsl(204, 70%, 50%)",
      "burger": 15,
      "burgerColor": "hsl(246, 70%, 50%)",
      "sandwich": 145,
      "sandwichColor": "hsl(157, 70%, 50%)",
      "kebab": 15,
      "kebabColor": "hsl(31, 70%, 50%)",
      "fries": 136,
      "friesColor": "hsl(130, 70%, 50%)",
      "donut": 15,
      "donutColor": "hsl(83, 70%, 50%)"
    },
    {
      "country": "AG",
      "hot dog": 24,
      "hot dogColor": "hsl(267, 70%, 50%)",
      "burger": 146,
      "burgerColor": "hsl(200, 70%, 50%)",
      "sandwich": 165,
      "sandwichColor": "hsl(190, 70%, 50%)",
      "kebab": 176,
      "kebabColor": "hsl(193, 70%, 50%)",
      "fries": 170,
      "friesColor": "hsl(101, 70%, 50%)",
      "donut": 173,
      "donutColor": "hsl(155, 70%, 50%)"
    },
    {
      "country": "AI",
      "hot dog": 164,
      "hot dogColor": "hsl(156, 70%, 50%)",
      "burger": 168,
      "burgerColor": "hsl(106, 70%, 50%)",
      "sandwich": 125,
      "sandwichColor": "hsl(311, 70%, 50%)",
      "kebab": 94,
      "kebabColor": "hsl(311, 70%, 50%)",
      "fries": 194,
      "friesColor": "hsl(54, 70%, 50%)",
      "donut": 168,
      "donutColor": "hsl(86, 70%, 50%)"
    },
    {
      "country": "AL",
      "hot dog": 22,
      "hot dogColor": "hsl(117, 70%, 50%)",
      "burger": 17,
      "burgerColor": "hsl(283, 70%, 50%)",
      "sandwich": 16,
      "sandwichColor": "hsl(169, 70%, 50%)",
      "kebab": 166,
      "kebabColor": "hsl(327, 70%, 50%)",
      "fries": 73,
      "friesColor": "hsl(91, 70%, 50%)",
      "donut": 20,
      "donutColor": "hsl(357, 70%, 50%)"
    },
    {
      "country": "AM",
      "hot dog": 55,
      "hot dogColor": "hsl(68, 70%, 50%)",
      "burger": 124,
      "burgerColor": "hsl(196, 70%, 50%)",
      "sandwich": 199,
      "sandwichColor": "hsl(62, 70%, 50%)",
      "kebab": 108,
      "kebabColor": "hsl(72, 70%, 50%)",
      "fries": 140,
      "friesColor": "hsl(265, 70%, 50%)",
      "donut": 118,
      "donutColor": "hsl(358, 70%, 50%)"
    }
  ]

export default function MyResponsiveBar(){
    return(
   <></>
    );
    }