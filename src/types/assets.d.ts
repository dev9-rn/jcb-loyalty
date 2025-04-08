declare module "*.png" {
    const value: any;
    export default value;
}

declare module "*.jpg" {
    const value: any;
    export default value;
}

declare module "*.jpeg" {
    const value: any;
    export default value;
}

declare module "*.svg" {
    import React from "react";
    import { SvgProps } from "react-native-svg";
    const content: React.FC<SvgProps>;
    export default content;
};

declare module "*.mp3" {
    const value: any;
    export default value;
}

declare module "*.wav" {
    const value: any;
    export default value;
}

declare module "*.m4a" {
    const value: any;
    export default value;
}

