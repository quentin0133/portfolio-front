import {TagType} from "./tag-type";

export interface Tag {
  id: number,
  version: number,
  name: string,
  tagType: TagType
}
