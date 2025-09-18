export type CropType = "fit" | "fill";

export type CropOptions = {
	cropPresents: CropType;
	padColor: string;
};

export enum Crop {
	Fit = "fit",
	Fill = "fill",
}
