from pyteal import *

def approval_program():
    on_creation = Seq([
        App.globalPut(Bytes("Creator"), Txn.sender()),
        App.globalPut(Bytes("Counter"), Int(0)),
        Return(Int(1))
    ])

    # Checks whether the sender is creator.
    is_creator = Txn.sender() == App.globalGet(Bytes("Creator"))
    current_counter = App.globalGet(Bytes("Counter"))

    on_closeout = Seq([
        Return(Int(1))
    ])

    on_register = Seq([
        Return(Int(1))
    ])

    on_increment = Seq([
        App.globalPut(Bytes("Counter"), current_counter + Int(1)),
        Return(Int(1))
    ])

    # Verfies that the application_id is 0, jumps to on_creation.
    # Verifies that DeleteApplication is used and verifies that sender is creator.
    # Verifies that UpdateApplication is used and verifies that sender is creator.
    # Verifies that closeOut is used and jumps to on_closeout.
    # Verifies that the account has opted in and jumps to on_register.
    # Verifies that first argument is "vote" and jumps to on_vote.
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(is_creator)],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(is_creator)],
        [Txn.on_completion() == OnComplete.CloseOut, on_closeout],
        [Txn.on_completion() == OnComplete.OptIn, on_register],
        [Txn.application_args[0] == Bytes("increment"), on_increment]
    )

    return program

if __name__ == "__main__":
    print(compileTeal(approval_program(), Mode.Application, version = 4))