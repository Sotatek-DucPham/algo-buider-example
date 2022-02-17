import sys

sys.path.insert(0, ".")

from algobpy.parse import parse_params
from pyteal import *


def nft_escrow(app_id: int, asa_id: int):
    return Seq(
        [
            Assert(Global.group_size() == Int(3)),
            Assert(Gtxn[0].application_id() == Int(app_id)),
            Assert(Gtxn[1].type_enum() == TxnType.Payment),
            Assert(Gtxn[2].asset_amount() == Int(1)),
            Assert(Gtxn[2].xfer_asset() == Int(asa_id)),
            Assert(Gtxn[2].fee() <= Int(1000)),
            Assert(Gtxn[2].asset_close_to() == Global.zero_address()),
            Assert(Gtxn[2].rekey_to() == Global.zero_address()),
            Return(Int(1)),
        ]
    )


if __name__ == "__main__":
    # this is the default value (globalZeroAddress) of RECEIVER_ADDRESS. If template parameter
    # via scripts is not passed then this value will be used.
    params = {
        "APP_ID": 1,
        "ASA_ID": 1,
    }

    # Overwrite params if sys.argv[1] is passed
    if len(sys.argv) > 1:
        params = parse_params(sys.argv[1], params)

    print(compileTeal(nft_escrow(params["APP_ID"], params["ASA_ID"]), Mode.Signature))
