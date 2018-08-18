import { Checkbox, Select, FormControl, MenuItem, InputLabel, FormControlLabel, FormGroup, Switch, Typography } from '@material-ui/core';
import { Slider } from '@material-ui/lab';
import * as React from 'react';


interface IDropDownControlProps<T, K extends keyof T> {
  controls: T,
  controlKey: K,
  text?: string,
  options: string[][],
  disabled?: boolean,
  noneOption?: boolean,
  updateControls: (key: K, value: string) => void
};

export class DropDownControl<T, K extends keyof T> extends React.Component<IDropDownControlProps<T, K>> {
  public render() {
    const {controlKey, controls } = this.props;

    const selectedValue = controls[controlKey] || '';

    if (typeof selectedValue === 'string') {
      return (
        <FormControl style={{minWidth: 120}}>
          <InputLabel htmlFor="age-simple">{this.props.text || this.props.controlKey}</InputLabel>
          <Select
            disabled={this.props.disabled}
            value={selectedValue}
            onChange={this.handleChanged}
            inputProps={{
              name: this.props.controlKey,
              id: this.props.controlKey,
            }}
          >
            {this.props.noneOption && (
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
            )}
           {this.props.options.map(([key, value])=> (
              <MenuItem key={key} value={key}>{value}</MenuItem>
            ))}
         </Select>
        </FormControl>
      )
    } else {
      throw new Error(`Key ${controlKey} is not a string`);
    }
  }

  private handleChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // tslint:disable-next-line:no-debugger
    this.props.updateControls(this.props.controlKey, event.target.value);
  }
}

interface ICheckboxControlProps<T, K extends keyof T> {
  controls: T,
  controlKey: K,
  text?: string,
  updateControls: (key: K, value: boolean) => void
};

export class CheckboxControl<T, K extends keyof T> extends React.Component<ICheckboxControlProps<T, K>> {
  public render() {
    const {controlKey, controls } = this.props;

    const checked = controls[controlKey];

    if (typeof checked === 'boolean') {
      return (
       <Typography>
          <label>
            {this.props.text || this.props.controlKey}
            <Checkbox name={this.props.controlKey as string} checked={checked} onChange={this.handleChanged} />
          </label>
        </Typography>
      );
    } else {
      throw new Error(`Key ${controlKey} is not a boolean`);
    }
  }

  private handleChanged = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    this.props.updateControls(this.props.controlKey, checked);
  }
}

interface ISwitchControlProps<T, K extends keyof T> {
  controls: T,
  controlKey: K,
  text?: string,
  disabled?: boolean,
  updateControls: (key: K, value: boolean) => void
};

export class SwitchControl<T, K extends keyof T> extends React.Component<ISwitchControlProps<T, K>> {
  public render() {
    const {disabled, text, controlKey, controls } = this.props;

    const checked = controls[controlKey];

    if (typeof checked === 'boolean') {
      return (
        <FormGroup row>
        <FormControlLabel
          control={
            <Switch
              checked={checked}
              onChange={this.handleChanged}
              value="checkedA"
              disabled={disabled}
            />
          }
          label={text || controlKey}
        />
       </FormGroup>
     );
    } else {
      throw new Error(`Key ${controlKey} is not a boolean`);
    }
  }

  private handleChanged = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    this.props.updateControls(this.props.controlKey, checked);
  }
}

interface ISliderControlProps<T, K extends keyof T> {
  controls: T,
  controlKey: K,
  text?: string,
  step?: number,
  min: number,
  max: number,
  updateControls: (key: K, value: number) => void
}

export class SliderControl<T, K extends keyof T> extends React.Component<ISliderControlProps<T, K>> {
  public render() {
    const {controlKey, controls} = this.props;

    const value = controls[controlKey];

    if (typeof value === 'number') {
      return (
        <div>
          <Typography id="label">{this.props.text || this.props.controlKey}: {value}</Typography>
          <Slider min={this.props.min} max={this.props.max} step={this.props.step} value={value} aria-labelledby="label" onChange={this.handleChanged} />
        </div>
      )
    } else {
      throw new Error(`Key ${controlKey} is not a number`);
    }
  }

  private handleChanged = (event: React.ChangeEvent<HTMLInputElement>, value: number) => {
    this.props.updateControls(this.props.controlKey, value);
  }

}
