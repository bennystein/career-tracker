#!/bin/bash
# Tears down the scratch Postgres from reconstruct-local-db.sh. Run this when
# you're done querying/rendering -- there's no reason to leave a database
# server running between tasks.
pg_ctlcluster 16 main stop 2>&1 || true
echo "Local scratch Postgres stopped."
