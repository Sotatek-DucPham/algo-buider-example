setup-master-account:
# Create an account with WWYNX3TKQYVEREVSW6QQP3SXSFOCE3SKUSEIVJ7YAGUPEACNI5UGI4DZCE address:
	./sandbox goal account import -m "enforce drive foster uniform cradle tired win arrow wasp melt cattle chronic sport dinosaur announce shell correct shed amused dismiss mother jazz task above hospital"
# Send lot of ALGO from a primary account to the "master" account we created above
	@$(eval list=$(shell ./sandbox goal account list))
	@$(eval netAddress=$(shell echo $(list) | awk '{print $$2}'))
	./sandbox goal clerk send -a 2000000000000 -f $(netAddress) -t WWYNX3TKQYVEREVSW6QQP3SXSFOCE3SKUSEIVJ7YAGUPEACNI5UGI4DZCE
