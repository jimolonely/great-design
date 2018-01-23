import React, { Component } from "react";
import { Input, Button } from "antd";
import {
    ScatterChart, Scatter, XAxis, YAxis,
    ZAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

const data01 = [
    { hour: '12a', index: 1, value: 170 },
    { hour: '1a', index: 1, value: 180 },
    { hour: '2a', index: 1, value: 150 },
    { hour: '3a', index: 1, value: 120 },
    { hour: '4a', index: 1, value: 200 },
    { hour: '5a', index: 1, value: 300 },
    { hour: '6a', index: 1, value: 400 },
    { hour: '7a', index: 1, value: 200 },
    { hour: '8a', index: 1, value: 100 },
    { hour: '9a', index: 1, value: 150 },
    { hour: '10a', index: 1, value: 160 },
    { hour: '11a', index: 1, value: 170 },
    { hour: '12a', index: 1, value: 180 },
    { hour: '1p', index: 1, value: 144 },
    { hour: '2p', index: 1, value: 166 },
    { hour: '3p', index: 1, value: 145 },
    { hour: '4p', index: 1, value: 150 },
    { hour: '5p', index: 1, value: 170 },
    { hour: '6p', index: 1, value: 180 },
    { hour: '7p', index: 1, value: 165 },
    { hour: '8p', index: 1, value: 130 },
    { hour: '9p', index: 1, value: 140 },
    { hour: '10p', index: 1, value: 170 },
    { hour: '11p', index: 1, value: 180 },
];

const data02 = [
    { hour: '12a', index: 1, value: 160 },
    { hour: '1a', index: 1, value: 180 },
    { hour: '2a', index: 1, value: 150 },
    { hour: '3a', index: 1, value: 120 },
    { hour: '4a', index: 1, value: 200 },
    { hour: '5a', index: 1, value: 300 },
    { hour: '6a', index: 1, value: 100 },
    { hour: '7a', index: 1, value: 200 },
    { hour: '8a', index: 1, value: 100 },
    { hour: '9a', index: 1, value: 150 },
    { hour: '10a', index: 1, value: 160 },
    { hour: '11a', index: 1, value: 160 },
    { hour: '12a', index: 1, value: 180 },
    { hour: '1p', index: 1, value: 144 },
    { hour: '2p', index: 1, value: 166 },
    { hour: '3p', index: 1, value: 145 },
    { hour: '4p', index: 1, value: 150 },
    { hour: '5p', index: 1, value: 160 },
    { hour: '6p', index: 1, value: 180 },
    { hour: '7p', index: 1, value: 165 },
    { hour: '8p', index: 1, value: 130 },
    { hour: '9p', index: 1, value: 140 },
    { hour: '10p', index: 1, value: 160 },
    { hour: '11p', index: 1, value: 180 },
];

const parseDomain = () => {
    return [
        0,
        Math.max.apply(null, [
            ...data01.map(entry => entry.value),
            ...data02.map(entry => entry.value)
        ])
    ];
};

class ThreeDimScatterChart extends Component{
    constructor(props) {
        super(props);
        this.state = {
            specialityCode: ''
        }
        // this.onChangeCode = this.onChangeCode.bind(this);
        this.renderTooltip = this.renderTooltip.bind(this);
    }

    renderTooltip(props) {
        const { active, payload } = props;

        if (active && payload && payload.length) {
            const data = payload[0].payload;

            return (
                <div style={{ backgroundColor: '#fff', border: '1px solid #999', margin: 0, padding: 10 }}>
                    <p>{data.hour}</p>
                    <p><span>value: </span>{data.value}</p>
                </div>
            );
        }

        return null;
    }

    render() {
        const domain = parseDomain();
        const range = [16, 225];

        return (
            <div>
                <ScatterChart width={800} height={60} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
                    <XAxis type="category" dataKey="hour" interval={0} tick={{ fontSize: 0 }} tickLine={{ transform: 'translate(0, -6)' }} />
                    <YAxis type="number" dataKey="index" name="A" height={10} width={80} tick={false} tickLine={false} axisLine={false} label={{ value: 'A课', position: 'insideRight' }} />
                    <ZAxis type="number" dataKey="value" domain={domain} range={range} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} wrapperStyle={{ zIndex: 100 }} content={this.renderTooltip} />
                    <Scatter data={data01} fill='#8884d8' />
                </ScatterChart>

                <ScatterChart width={800} height={60} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
                    <XAxis type="category" dataKey="hour" name="hour" interval={0} tick={{ fontSize: 0 }} tickLine={{ transform: 'translate(0, -6)' }} />
                    <YAxis type="number" dataKey="index" height={10} width={80} tick={false} tickLine={false} axisLine={false} label={{ value: 'B课', position: 'insideRight' }} />
                    <ZAxis type="number" dataKey="value" domain={domain} range={range} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} wrapperStyle={{ zIndex: 100 }} content={this.renderTooltip} />
                    <Scatter data={data02} fill='#8884d8' />
                </ScatterChart>
            </div>
        );
    }
}

// class CourseRelation extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             specialityCode: ''
//         }
//         this.onChangeCode = this.onChangeCode.bind(this);
//     }

//     onChangeCode(e) {
//         this.setState({
//             specialityCode: e.target.value
//         })
//     }

//     render() {
//         return (
//             <div>

//             </div>
//         )
//     }
// }

// export default CourseRelation;
export default ThreeDimScatterChart;