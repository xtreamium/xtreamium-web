import { convertUTCToLocal } from "@/utils/date-utils";

export interface IEPGListingMap {
  channel: string;
  start: number;
  stop: number;
  title: string[];
  desc: string[];
}
export class EPGListing {
  channel!: string;
  private start!: number;
  private stop!: number;
  private title!: string[];
  private desc!: string[];

  public getStartTime = (): number => {
    return convertUTCToLocal(new Date(this.start)).getTime();
  };
  public getStopTime = (): number => {
    return convertUTCToLocal(new Date(this.stop)).getTime();
  };
  public getTitle = (): string => this.title.map((t) => t).join("\n");
  public getDescription = (): string => this.desc.map((t) => t).join("\n");
}
