export const graphConfig = {
        "directed":true,
        "automaticRearrangeAfterDropNode": true,
        "collapsible": false,
        "height": 550,
        "highlightDegree": 1,
        "highlightOpacity": 1,
        "linkHighlightBehavior": false,
        "maxZoom": 8,
        "minZoom": 0.1,
        "nodeHighlightBehavior": true,
        "panAndZoom": true,
        "staticGraph": false,
        "width": 1100,
        "focusAnimationDuration": 0.75,
        "focusZoom": 1,
        "d3": {
            "alphaTarget": 0.05,
            "gravity": -100,
            "linkLength": 100,
            "linkStrength": 1
        },
        "node": {
            "color": "lightblue",
            "fontColor": "black",
            "fontSize": 10,
            "fontWeight": "normal",
            "highlightColor": "SAME",
            "highlightFontSize": 12,
            "highlightFontWeight": "normal",
            "highlightStrokeColor": "blue",
            "highlightStrokeWidth": 1.5,
            "labelProperty": "title",
            "mouseCursor": "pointer",
            "opacity": 1,
            "renderLabel": true,
            "size": 600,
            "strokeColor": "none",
            "strokeWidth": 1.5,
            "svg": "",
            "symbolType": "circle",
            "viewGenerator": null,
        },
        "link": {
            "color": "lightblue",
            "className": "link-graph",
            "type": 'STRAIGHT',
            "highlightColor": "#d3d3d3",
        }

};

export * from './graphConfig'