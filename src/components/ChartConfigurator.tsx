import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine, LineSeries } from '@nivo/line';
import { ColorSchemeId } from '@nivo/colors';
import { Task } from '../services/api'; // Assuming Task type is defined here or needs to be passed

interface ChartConfiguratorProps {
  tasks: Task[];
  confirmedTaskColumnKeys: Set<string>;
  getTaskValue: (task: Task, key: string) => any;
  
  // Chart Type selection
  chartType: 'bar' | 'line';
  setChartType: React.Dispatch<React.SetStateAction<'bar' | 'line'>>;

  // Bar Chart States
  barChartIndexBy: string;
  setBarChartIndexBy: React.Dispatch<React.SetStateAction<string>>;
  barChartKeys: string[];
  setBarChartKeys: React.Dispatch<React.SetStateAction<string[]>>;
  barChartLayout: 'vertical' | 'horizontal';
  setBarChartLayout: React.Dispatch<React.SetStateAction<'vertical' | 'horizontal'>>;
  barChartGroupMode: 'stacked' | 'grouped';
  setBarChartGroupMode: React.Dispatch<React.SetStateAction<'stacked' | 'grouped'>>;
  barChartReverse: boolean;
  setBarChartReverse: React.Dispatch<React.SetStateAction<boolean>>;
  barChartPadding: number;
  setBarChartPadding: React.Dispatch<React.SetStateAction<number>>;
  barChartShowAxisTop: boolean;
  setBarChartShowAxisTop: React.Dispatch<React.SetStateAction<boolean>>;
  barChartShowAxisRight: boolean;
  setBarChartShowAxisRight: React.Dispatch<React.SetStateAction<boolean>>;
  barChartShowAxisBottom: boolean;
  setBarChartShowAxisBottom: React.Dispatch<React.SetStateAction<boolean>>;
  barChartShowAxisLeft: boolean;
  setBarChartShowAxisLeft: React.Dispatch<React.SetStateAction<boolean>>;
  barChartEnableGridX: boolean;
  setBarChartEnableGridX: React.Dispatch<React.SetStateAction<boolean>>;
  barChartEnableGridY: boolean;
  setBarChartEnableGridY: React.Dispatch<React.SetStateAction<boolean>>;
  barChartEnableLabel: boolean;
  setBarChartEnableLabel: React.Dispatch<React.SetStateAction<boolean>>;
  barChartLabelSkipWidth: number;
  setBarChartLabelSkipWidth: React.Dispatch<React.SetStateAction<number>>;
  barChartLabelSkipHeight: number;
  setBarChartLabelSkipHeight: React.Dispatch<React.SetStateAction<number>>;
  barChartWidth: string;
  setBarChartWidth: React.Dispatch<React.SetStateAction<string>>;
  barChartHeight: number;
  setBarChartHeight: React.Dispatch<React.SetStateAction<number>>;

  // Line Chart States
  lineChartEnableGridX: boolean;
  setLineChartEnableGridX: React.Dispatch<React.SetStateAction<boolean>>;
  lineChartEnableGridY: boolean;
  setLineChartEnableGridY: React.Dispatch<React.SetStateAction<boolean>>;
  lineChartXKey: string;
  setLineChartXKey: React.Dispatch<React.SetStateAction<string>>;
  lineChartYKeys: string[];
  setLineChartYKeys: React.Dispatch<React.SetStateAction<string[]>>;
  lineChartCurve: 'linear' | 'cardinal' | 'step' | 'monotoneX';
  setLineChartCurve: React.Dispatch<React.SetStateAction<'linear' | 'cardinal' | 'step' | 'monotoneX'>>;
  lineChartEnablePoints: boolean;
  setLineChartEnablePoints: React.Dispatch<React.SetStateAction<boolean>>;
  lineChartPointSize: number;
  setLineChartPointSize: React.Dispatch<React.SetStateAction<number>>;
  lineChartEnableArea: boolean;
  setLineChartEnableArea: React.Dispatch<React.SetStateAction<boolean>>;
  lineChartLineWidth: number;
  setLineChartLineWidth: React.Dispatch<React.SetStateAction<number>>;
  lineChartPointBorderWidth: number;
  setLineChartPointBorderWidth: React.Dispatch<React.SetStateAction<number>>;
  lineChartPointLabel: string;
  setLineChartPointLabel: React.Dispatch<React.SetStateAction<string>>;
  lineChartPointLabelYOffset: number;
  setLineChartPointLabelYOffset: React.Dispatch<React.SetStateAction<number>>;
  lineChartUseThemeBackgroundForPointColor: boolean;
  setLineChartUseThemeBackgroundForPointColor: React.Dispatch<React.SetStateAction<boolean>>;
  lineChartCustomPointColor: string;
  setLineChartCustomPointColor: React.Dispatch<React.SetStateAction<string>>;
  lineChartAreaOpacity: number;
  setLineChartAreaOpacity: React.Dispatch<React.SetStateAction<number>>;
  lineChartUseMesh: boolean;
  setLineChartUseMesh: React.Dispatch<React.SetStateAction<boolean>>;
  lineChartXScaleType: 'point' | 'linear';
  setLineChartXScaleType: React.Dispatch<React.SetStateAction<'point' | 'linear'>>;
  lineChartMarginTop: number;
  setLineChartMarginTop: React.Dispatch<React.SetStateAction<number>>;
  lineChartMarginRight: number;
  setLineChartMarginRight: React.Dispatch<React.SetStateAction<number>>;
  lineChartMarginBottom: number;
  setLineChartMarginBottom: React.Dispatch<React.SetStateAction<number>>;
  lineChartMarginLeft: number;
  setLineChartMarginLeft: React.Dispatch<React.SetStateAction<number>>;
  lineChartColorsScheme: ColorSchemeId;
  setLineChartColorsScheme: React.Dispatch<React.SetStateAction<ColorSchemeId>>;
  lineChartWidth: string;
  setLineChartWidth: React.Dispatch<React.SetStateAction<string>>;
  lineChartHeight: number;
  setLineChartHeight: React.Dispatch<React.SetStateAction<number>>;
}

const ChartConfigurator: React.FC<ChartConfiguratorProps> = ({
  tasks,
  confirmedTaskColumnKeys,
  getTaskValue,
  chartType,
  setChartType,
  barChartIndexBy,
  setBarChartIndexBy,
  barChartKeys,
  setBarChartKeys,
  barChartLayout,
  setBarChartLayout,
  barChartGroupMode,
  setBarChartGroupMode,
  barChartReverse,
  setBarChartReverse,
  barChartPadding,
  setBarChartPadding,
  barChartShowAxisTop,
  setBarChartShowAxisTop,
  barChartShowAxisRight,
  setBarChartShowAxisRight,
  barChartShowAxisBottom,
  setBarChartShowAxisBottom,
  barChartShowAxisLeft,
  setBarChartShowAxisLeft,
  barChartEnableGridX,
  setBarChartEnableGridX,
  barChartEnableGridY,
  setBarChartEnableGridY,
  barChartEnableLabel,
  setBarChartEnableLabel,
  barChartLabelSkipWidth,
  setBarChartLabelSkipWidth,
  barChartLabelSkipHeight,
  setBarChartLabelSkipHeight,
  barChartWidth,
  setBarChartWidth,
  barChartHeight,
  setBarChartHeight,
  lineChartXKey,
  lineChartEnableGridX,
  setLineChartEnableGridX,
  lineChartEnableGridY,
  setLineChartEnableGridY,
  setLineChartXKey,
  lineChartYKeys,
  setLineChartYKeys,
  lineChartCurve,
  setLineChartCurve,
  lineChartEnablePoints,
  setLineChartEnablePoints,
  lineChartPointSize,
  setLineChartPointSize,
  lineChartEnableArea,
  setLineChartEnableArea,
  lineChartLineWidth,
  setLineChartLineWidth,
  lineChartPointBorderWidth,
  setLineChartPointBorderWidth,
  lineChartPointLabel,
  setLineChartPointLabel,
  lineChartPointLabelYOffset,
  setLineChartPointLabelYOffset,
  lineChartUseThemeBackgroundForPointColor,
  setLineChartUseThemeBackgroundForPointColor,
  lineChartCustomPointColor,
  setLineChartCustomPointColor,
  lineChartAreaOpacity,
  setLineChartAreaOpacity,
  lineChartUseMesh,
  setLineChartUseMesh,
  lineChartXScaleType,
  setLineChartXScaleType,
  lineChartMarginTop,
  setLineChartMarginTop,
  lineChartMarginRight,
  setLineChartMarginRight,
  lineChartMarginBottom,
  setLineChartMarginBottom,
  lineChartMarginLeft,
  setLineChartMarginLeft,
  lineChartColorsScheme,
  setLineChartColorsScheme,
  lineChartWidth,
  setLineChartWidth,
  lineChartHeight,
  setLineChartHeight,
}) => {
  const handleChartTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'bar' | 'line';
    setChartType(newType);
  };

  const getLineChartData = (): LineSeries[] => {
    if (!lineChartXKey || lineChartYKeys.length === 0 || tasks.length === 0) {
      return [];
    }
  
    let processedTasks = [...tasks].sort((a, b) => {
        const valA = getTaskValue(a, lineChartXKey);
        const valB = getTaskValue(b, lineChartXKey);
        if (valA < valB) return -1;
        if (valA > valB) return 1;
        return 0;
    });

    return lineChartYKeys.map(yKey => {
      const seriesData = processedTasks
        .map(task => {
          const xValue = getTaskValue(task, lineChartXKey);
          const yValue = getTaskValue(task, yKey);
          const numericYValue = yValue !== null && yValue !== undefined && !isNaN(Number(yValue)) ? Number(yValue) : null;
          
          if (xValue !== null && xValue !== undefined && numericYValue !== null) {
            return { x: xValue, y: numericYValue };
          }
          return null;
        })
        .filter((d): d is { x: string | number; y: number } => d !== null);
  
      return {
        id: yKey,
        data: seriesData,
      };
    });
  };

  return (
    <div style={{ marginTop: '30px'}}>
      <h3>Chart Configuration</h3>
      <p>Select a Nivo chart type and configure its settings using the confirmed columns: <strong>{Array.from(confirmedTaskColumnKeys).join(', ') || 'None'}</strong></p>
      <p>Task data row count: {tasks.length}</p>
      {confirmedTaskColumnKeys.size > 0 && tasks.length > 0 && (
        <>
          <div>
            <label htmlFor="chartType">Chart Type:</label>
            <select id="chartType" value={chartType} onChange={handleChartTypeChange}>
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
            </select>
          </div>

          {chartType === 'bar' && (
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd' }}>
              <h4>Bar Chart Configuration (<code>@nivo/bar</code>)</h4>
              <div>
                <label htmlFor="barIndexBy">Index By (X-axis): </label>
                <select id="barIndexBy" value={barChartIndexBy} onChange={(e) => setBarChartIndexBy(e.target.value)}>
                  <option value="">-- Select X-axis --</option>
                  {Array.from(confirmedTaskColumnKeys).map(key => <option key={key} value={key}>{key}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="barKeys">Keys (Y-axis values): </label>
                <select id="barKeys" value={barChartKeys[0] || ''} onChange={(e) => setBarChartKeys(e.target.value ? [e.target.value] : [])}>
                  <option value="">-- Select Y-axis --</option>
                  {Array.from(confirmedTaskColumnKeys).map(key => <option key={key} value={key}>{key}</option>)}
                </select>
              </div>
              <div style={{ marginTop: '10px' }}>
                <label htmlFor="barChartWidth">Width (e.g., 94%, 500px): </label>
                <input type="text" id="barChartWidth" value={barChartWidth} onChange={(e) => setBarChartWidth(e.target.value)} style={{width: '100px'}}/>
                <label htmlFor="barChartHeight" style={{ marginLeft: '15px' }}>Height (px): </label>
                <input type="number" id="barChartHeight" value={barChartHeight} onChange={(e) => setBarChartHeight(parseInt(e.target.value, 10))} min="100" style={{width: '80px'}}/>
              </div>
              <div style={{ marginTop: '10px' }}>
                <label htmlFor="barLayout">Layout: </label>
                <select id="barLayout" value={barChartLayout} onChange={(e) => setBarChartLayout(e.target.value as 'vertical' | 'horizontal')}>
                  <option value="vertical">Vertical</option>
                  <option value="horizontal">Horizontal</option>
                </select>
                <label htmlFor="barGroupMode" style={{ marginLeft: '15px' }}>Group Mode: </label>
                <select id="barGroupMode" value={barChartGroupMode} onChange={(e) => setBarChartGroupMode(e.target.value as 'stacked' | 'grouped')}>
                  <option value="stacked">Stacked</option>
                  <option value="grouped">Grouped</option>
                </select>
                <label htmlFor="barReverse" style={{ marginLeft: '15px' }}>Reverse: </label>
                <input
                  type="checkbox"
                  id="barReverse"
                  checked={barChartReverse}
                  onChange={(e) => setBarChartReverse(e.target.checked)}
                />
                <label htmlFor="barPadding" style={{ marginLeft: '15px' }}>Padding: </label>
                <input type="number" value={barChartPadding} onChange={e => setBarChartPadding(parseFloat(e.target.value))} min="0" max="1" step="0.05" style={{width: '50px'}}/>
              </div>
              <div style={{ marginTop: '10px' }}>
                <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Axes:</span>
                <label htmlFor="barAxisTop" style={{ marginRight: '5px' }}>Top: </label>
                <input type="checkbox" id="barAxisTop" checked={barChartShowAxisTop} onChange={(e) => setBarChartShowAxisTop(e.target.checked)} />
                <label htmlFor="barAxisRight" style={{ marginLeft: '10px', marginRight: '5px' }}>Right: </label>
                <input type="checkbox" id="barAxisRight" checked={barChartShowAxisRight} onChange={(e) => setBarChartShowAxisRight(e.target.checked)} />
                <label htmlFor="barAxisBottom" style={{ marginLeft: '10px', marginRight: '5px' }}>Bottom: </label>
                <input type="checkbox" id="barAxisBottom" checked={barChartShowAxisBottom} onChange={(e) => setBarChartShowAxisBottom(e.target.checked)} />
                <label htmlFor="barAxisLeft" style={{ marginLeft: '10px', marginRight: '5px' }}>Left: </label>
                <input type="checkbox" id="barAxisLeft" checked={barChartShowAxisLeft} onChange={(e) => setBarChartShowAxisLeft(e.target.checked)} />
              </div>
              <div style={{ marginTop: '5px' }}>
                <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Grids:</span>
                <label htmlFor="barEnableGridX" style={{ marginRight: '5px' }}>Enable X Grid: </label>
                <input
                  type="checkbox"
                  id="barEnableGridX"
                  checked={barChartEnableGridX}
                  onChange={(e) => setBarChartEnableGridX(e.target.checked)}
                />
                <label htmlFor="barEnableGridY" style={{ marginLeft: '10px', marginRight: '5px' }}>Enable Y Grid: </label>
                <input
                  type="checkbox"
                  id="barEnableGridY"
                  checked={barChartEnableGridY}
                  onChange={(e) => setBarChartEnableGridY(e.target.checked)}
                />
              </div>
              <div style={{ marginTop: '10px' }}>
                <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Labels:</span>
                <label htmlFor="barEnableLabel" style={{ marginRight: '5px' }}>Enable Labels: </label>
                <input
                  type="checkbox"
                  id="barEnableLabel"
                  checked={barChartEnableLabel}
                  onChange={(e) => setBarChartEnableLabel(e.target.checked)}
                />
                <label htmlFor="barLabelSkipWidth" style={{ marginLeft: '10px', marginRight: '5px' }}>Skip Width: </label>
                <input type="number" id="barLabelSkipWidth" value={barChartLabelSkipWidth} onChange={(e) => setBarChartLabelSkipWidth(parseInt(e.target.value, 10))} style={{width: '50px'}}/>
                <label htmlFor="barLabelSkipHeight" style={{ marginLeft: '10px', marginRight: '5px' }}>Skip Height: </label>
                <input type="number" id="barLabelSkipHeight" value={barChartLabelSkipHeight} onChange={(e) => setBarChartLabelSkipHeight(parseInt(e.target.value, 10))} style={{width: '50px'}}/>
              </div>
              {barChartIndexBy && barChartKeys.length > 0 && (
                <div style={{ height: barChartHeight, width: barChartWidth, marginTop: '10px' }}>
                  <ResponsiveBar
                    data={tasks.map(task => {
                      const item: { [key: string]: any } = {
                        [barChartIndexBy]: getTaskValue(task, barChartIndexBy)
                      };
                      barChartKeys.forEach(yKey => {
                        item[yKey] = getTaskValue(task, yKey);
                      });
                      return item;
                    })}
                    indexBy={barChartIndexBy}
                    layout={barChartLayout}
                    groupMode={barChartGroupMode}
                    keys={barChartKeys}
                    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                    padding={barChartPadding}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={{ scheme: 'nivo' }}
                    axisTop={barChartShowAxisTop ? { legend: 'Top Axis (optional)' } : null}
                    axisRight={barChartShowAxisRight ? { legend: 'Right Axis (optional)' } : null}
                    axisBottom={barChartShowAxisBottom ? {
                      legend: barChartLayout === 'horizontal' ? barChartKeys.join(', ') : barChartIndexBy,
                      legendPosition: 'middle',
                      legendOffset: 32,
                    } : null}
                    axisLeft={barChartShowAxisLeft ? {
                      legend: barChartLayout === 'horizontal' ? barChartIndexBy : barChartKeys.join(', '),
                      legendPosition: 'middle',
                      legendOffset: -40,
                    } : null}
                    enableGridX={barChartEnableGridX}
                    enableGridY={barChartEnableGridY}
                    enableLabel={barChartEnableLabel}
                    labelSkipWidth={barChartLabelSkipWidth}
                    labelSkipHeight={barChartLabelSkipHeight}
                  />
                </div>
              )}
            </div>
          )}

          {chartType === 'line' && (
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd' }}>
              <h4>Line Chart Configuration (<code>@nivo/line</code>)</h4>
              <div>
                <label htmlFor="lineXKey">X-Axis (e.g., Name, StartDate): </label>
                <select id="lineXKey" value={lineChartXKey} onChange={(e) => setLineChartXKey(e.target.value)}>
                    <option value="">-- Select X-axis --</option>
                    {Array.from(confirmedTaskColumnKeys).map(key => <option key={key} value={key}>{key}</option>)}
                </select>
                <label htmlFor="lineXScaleType" style={{ marginLeft: '10px' }}>X Scale Type: </label>
                <select id="lineXScaleType" value={lineChartXScaleType} onChange={(e) => setLineChartXScaleType(e.target.value as 'point' | 'linear')}>
                    <option value="point">Point (Categorical)</option>
                    <option value="linear">Linear (Numerical/Date)</option>
                </select>
              </div>
              <div>
                <label htmlFor="lineYKeys">Y-Axis (Lines): </label>
                <select id="lineYKeys" value={lineChartYKeys[0] || ''} onChange={(e) => setLineChartYKeys(e.target.value ? [e.target.value] : [])}>
                    <option value="">-- Select Y-axis --</option>
                    {Array.from(confirmedTaskColumnKeys)
                      .filter(key => key !== lineChartXKey)
                      .map(key => <option key={key} value={key}>{key}</option>)}
                </select>
              </div>
              <div style={{ marginTop: '10px' }}>
                <label htmlFor="lineChartWidth">Width (e.g., 94%, 500px): </label>
                <input type="text" id="lineChartWidth" value={lineChartWidth} onChange={(e) => setLineChartWidth(e.target.value)} style={{width: '100px'}}/>
                <label htmlFor="lineChartHeight" style={{ marginLeft: '15px' }}>Height (px): </label>
                <input type="number" id="lineChartHeight" value={lineChartHeight} onChange={(e) => setLineChartHeight(parseInt(e.target.value, 10))} min="100" style={{width: '80px'}}/>
              </div>
              <div style={{ marginTop: '10px' }}>
                <label htmlFor="lineCurve">Curve: </label>
                <select id="lineCurve" value={lineChartCurve} onChange={(e) => setLineChartCurve(e.target.value as 'linear' | 'cardinal' | 'step' | 'monotoneX')}>
                  <option value="linear">Linear</option>
                  <option value="monotoneX">Monotone X</option>
                  <option value="cardinal">Cardinal</option>
                  <option value="step">Step</option>
                </select>
                <label style={{ marginLeft: '15px' }}>
                  <input type="checkbox" checked={lineChartEnablePoints} onChange={e => setLineChartEnablePoints(e.target.checked)} />
                  Enable Points
                </label>
                <label style={{ marginLeft: '15px' }}>
                  <input type="checkbox" checked={lineChartEnableArea} onChange={e => setLineChartEnableArea(e.target.checked)} />
                  Enable Area
                </label>
                <label style={{ marginLeft: '15px' }}>
                  Line Width:
                  <input type="number" value={lineChartLineWidth} onChange={e => setLineChartLineWidth(parseInt(e.target.value, 10))} min="0" style={{ width: '50px', marginLeft: '5px' }} />
                </label>
              </div>
              <div style={{ marginTop: '10px' }}>
                <label>Point Color:</label>
                <input
                  type="checkbox"
                  checked={lineChartUseThemeBackgroundForPointColor}
                  onChange={e => setLineChartUseThemeBackgroundForPointColor(e.target.checked)}
                  style={{ marginLeft: '5px' }}
                /> Use Theme Background
                {!lineChartUseThemeBackgroundForPointColor && (
                  <input
                    type="color"
                    value={lineChartCustomPointColor}
                    onChange={e => setLineChartCustomPointColor(e.target.value)}
                    style={{ marginLeft: '10px' }}
                  />
                )}
                <label style={{ marginLeft: '15px' }}>Point Border Width:</label>
                <input type="number" value={lineChartPointBorderWidth} onChange={e => setLineChartPointBorderWidth(parseInt(e.target.value, 10))} min="0" style={{ width: '50px', marginLeft: '5px' }} />
              </div>
              <div style={{ marginTop: '10px' }}>
                <label htmlFor="linePointLabel">Point Label:</label>
                <select id="linePointLabel" value={lineChartPointLabel} onChange={e => setLineChartPointLabel(e.target.value)}>
                  <option value="">None</option>
                  <option value="x">X Value</option>
                  <option value="y">Y Value</option>
                </select>
                {lineChartPointLabel && (
                  <label style={{ marginLeft: '15px' }}>
                    Label Y Offset:
                    <input type="number" value={lineChartPointLabelYOffset} onChange={e => setLineChartPointLabelYOffset(parseInt(e.target.value, 10))} style={{ width: '50px', marginLeft: '5px' }} />
                  </label>
                )}
              </div>
              <div style={{ marginTop: '10px' }}>
                <label>Area Opacity:</label>
                <input type="number" value={lineChartAreaOpacity} onChange={e => setLineChartAreaOpacity(parseFloat(e.target.value))} min="0" max="1" step="0.05" style={{ width: '50px', marginLeft: '5px' }} />
                <label style={{ marginLeft: '15px' }}>
                  <input type="checkbox" checked={lineChartUseMesh} onChange={e => setLineChartUseMesh(e.target.checked)} />
                  Use Mesh (for Tooltip)
                </label>
              </div>
              <div style={{ marginTop: '10px' }}>
                <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Margins (px):</span>
                <label htmlFor="lineMarginTop">Top: </label>
                <input type="number" id="lineMarginTop" value={lineChartMarginTop} onChange={e => setLineChartMarginTop(parseInt(e.target.value, 10))} style={{ width: '50px' }} />
                <label htmlFor="lineMarginRight" style={{ marginLeft: '10px' }}>Right: </label>
                <input type="number" id="lineMarginRight" value={lineChartMarginRight} onChange={e => setLineChartMarginRight(parseInt(e.target.value, 10))} style={{ width: '50px' }} />
                <label htmlFor="lineMarginBottom" style={{ marginLeft: '10px' }}>Bottom: </label>
                <input type="number" id="lineMarginBottom" value={lineChartMarginBottom} onChange={e => setLineChartMarginBottom(parseInt(e.target.value, 10))} style={{ width: '50px' }} />
                <label htmlFor="lineMarginLeft" style={{ marginLeft: '10px' }}>Left: </label>
                <input type="number" id="lineMarginLeft" value={lineChartMarginLeft} onChange={e => setLineChartMarginLeft(parseInt(e.target.value, 10))} style={{ width: '50px' }} />
              </div>
              <div style={{ marginTop: '10px' }}>
                <label htmlFor="lineColorsScheme">Color Scheme: </label>
                <select id="lineColorsScheme" value={lineChartColorsScheme} onChange={e => setLineChartColorsScheme(e.target.value as ColorSchemeId)}>
                  <option value="nivo">nivo</option>
                  <option value="category10">category10</option>
                  <option value="accent">accent</option>
                  <option value="dark2">dark2</option>
                  <option value="paired">paired</option>
                  <option value="pastel1">pastel1</option>
                  <option value="pastel2">pastel2</option>
                  <option value="set1">set1</option>
                  <option value="set2">set2</option>
                  <option value="set3">set3</option>
                  <option value="brown_blueGreen">brown_blueGreen</option>
                  <option value="purpleRed_green">purpleRed_green</option>
                  <option value="pink_yellowGreen">pink_yellowGreen</option>
                  <option value="purple_orange">purple_orange</option>
                  <option value="red_blue">red_blue</option>
                  <option value="red_grey">red_grey</option>
                  <option value="red_yellow_blue">red_yellow_blue</option>
                  <option value="red_yellow_green">red_yellow_green</option>
                  <option value="spectral">spectral</option>
                </select>
              </div>
              <div style={{ marginTop: '10px' }}>
                <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Grids:</span>
                <label htmlFor="lineEnableGridX" style={{ marginRight: '5px' }}>Enable X Grid: </label>
                <input
                  type="checkbox"
                  id="lineEnableGridX"
                  checked={lineChartEnableGridX}
                  onChange={(e) => setLineChartEnableGridX(e.target.checked)}
                />
                <label htmlFor="lineEnableGridY" style={{ marginLeft: '10px', marginRight: '5px' }}>Enable Y Grid: </label>
                <input
                  type="checkbox"
                  id="lineEnableGridY"
                  checked={lineChartEnableGridY}
                  onChange={(e) => setLineChartEnableGridY(e.target.checked)}
                />
              </div>

              {lineChartXKey && lineChartYKeys.length > 0 && (
                <div style={{ height: lineChartHeight, width: lineChartWidth, marginTop: '10px' }}>
                  <ResponsiveLine
                    data={getLineChartData()}
                    margin={{ top: lineChartMarginTop, right: lineChartMarginRight, bottom: lineChartMarginBottom, left: lineChartMarginLeft }}
                    xScale={{ type: lineChartXScaleType, min: 'auto', max: 'auto' }}
                    yScale={{
                        type: 'linear',
                        min: 'auto',
                        max: 'auto',
                        stacked: false,
                        reverse: false
                    }}
                    yFormat=" >-.2f"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: lineChartXKey,
                        legendOffset: 36,
                        legendPosition: 'middle'
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: lineChartYKeys.join(', '),
                        legendOffset: -40,
                        legendPosition: 'middle'
                    }}
                    enableGridX={lineChartEnableGridX}
                    enableGridY={lineChartEnableGridY}
                    colors={{ scheme: lineChartColorsScheme }}
                    lineWidth={lineChartLineWidth}
                    enablePoints={lineChartEnablePoints}
                    pointSize={lineChartPointSize}
                    pointColor={lineChartUseThemeBackgroundForPointColor ? { theme: 'background' } : lineChartCustomPointColor}
                    pointBorderWidth={lineChartPointBorderWidth}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={lineChartPointLabelYOffset}
                    enableArea={lineChartEnableArea}
                    areaOpacity={lineChartAreaOpacity}
                    useMesh={lineChartUseMesh}
                    legends={[{
                        anchor: 'bottom-right', direction: 'column', justify: false, translateX: 100, translateY: 0, itemsSpacing: 0, itemDirection: 'left-to-right', itemWidth: 80, itemHeight: 20, itemOpacity: 0.75, symbolSize: 12, symbolShape: 'circle', symbolBorderColor: 'rgba(0, 0, 0, .5)', effects: [{ on: 'hover', style: { itemBackground: 'rgba(0, 0, 0, .03)', itemOpacity: 1 } }]
                    }]}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default ChartConfigurator;
