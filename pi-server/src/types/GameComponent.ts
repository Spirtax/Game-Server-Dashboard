import type { JSX } from "react/jsx-runtime";

type layoutItem = {
  type: string;
  w: number;
  h: number;
};

export type GameManifest = Record<string, string | string[]>;

/**
 * Interface for the Instance (the object created by 'new')
 */
export interface GameComponent {
  /*
   * Additional information a server needs in order to create it. E.g. Minecraft needs
   * a specified version, ARK needs a map, but Valheim needs nothing. All game types are
   * expected to create a respective function called get
   */
  getCreationRequirements(
    values: Record<string, string>,
    onChange: (key: string, value: string) => void,
  ): JSX.Element | null;

  /*
   * The render method is used to render the appropriate React components for the server stats modal based on the game type and layout configuration.
   * It takes in the layout and stats then returns an array of JSX elements to be rendered in the modal.
   */
  render(layout: layoutItem[], stats: any): (JSX.Element | null)[];

  /*
   * Grabs the manifest.json for the game which contains metadata and info about the server
   * such as creation requirements and data.
   */
  getManifest(): GameManifest;
}

/**
 * Interface for the Constructor (the Class definition itself).
 * This allows the registry to store the class and call 'new' on it.
 */
export type GameComponentConstructor = new () => GameComponent;
