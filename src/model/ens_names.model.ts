import { Entity } from "@subsquid/typeorm-store";
import {
  Entity as Entity_,
  Column as Column_,
  PrimaryColumn as PrimaryColumn_,
} from "typeorm";

@Entity_()
export class ensNames implements Entity {
  constructor(props?: Partial<ensNames>) {
    Object.assign(this, props);
  }

  @PrimaryColumn_()
  hash!: string;

  @Column_("varchar", { nullable: false })
  name!: string;

  get id(): string {
    return this.hash;
  }
}
