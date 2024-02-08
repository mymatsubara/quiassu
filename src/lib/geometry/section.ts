import { Vec2 } from "$lib/geometry/vec2";

export type SectionGeometry = {
    type: "rectangle";
    height: number;
    width: number;
} | {
    type: "polygon";
    points: Vec2[];
}
export type SectionType = SectionGeometry["type"];

export function getSectionPoints(section: SectionGeometry) {
    switch (section.type) {
        case "polygon":
            return section.points;
        case "rectangle":
            return [new Vec2(0, 0), new Vec2(0, section.height), new Vec2(section.width, section.height), new Vec2(section.width, 0)];
    }
}