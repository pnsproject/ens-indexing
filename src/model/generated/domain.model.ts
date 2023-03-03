import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {Account} from "./account.model"
import {Resolver} from "./resolver.model"
import {Registration} from "./registration.model"

@Entity_()
export class Domain {
    constructor(props?: Partial<Domain>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("text", {nullable: true})
    name!: string | undefined | null

    @Column_("text", {nullable: true})
    labelName!: string | undefined | null

    @Column_("text", {nullable: true})
    labelhash!: string | undefined | null

    @Index_()
    @ManyToOne_(() => Domain, {nullable: true})
    parent!: Domain | undefined | null

    @OneToMany_(() => Domain, e => e.parent)
    subdomains!: Domain[]

    @Column_("int4", {nullable: false})
    subdomainCount!: number

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    resolvedAddress!: Account | undefined | null

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    owner!: Account

    @Index_()
    @ManyToOne_(() => Resolver, {nullable: true})
    resolver!: Resolver | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    ttl!: bigint | undefined | null

    @Column_("bool", {nullable: true})
    isMigrated!: boolean | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    createdAt!: bigint

}
