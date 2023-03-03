import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import {Domain} from "./domain.model"
import {Account} from "./account.model"
import {TextChanged} from "./textChanged.model"

@Entity_()
export class Resolver {
    constructor(props?: Partial<Resolver>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Domain, {nullable: true})
    domain!: Domain | undefined | null

    @Column_("text", {nullable: false})
    address!: string

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    addr!: Account | undefined | null

    @Column_("text", {nullable: true})
    contentHash!: string | undefined | null

    @OneToMany_(() => TextChanged, e => e.resolver)
    textChangeds!: TextChanged[]

    @Column_("text", {nullable: true})
    x!: string | undefined | null

    @Column_("text", {nullable: true})
    y!: string | undefined | null

    @Column_("text", {nullable: true})
    name!: string | undefined | null

    @Column_("text", {nullable: true})
    muiltcoinAddress!: string | undefined | null
}
