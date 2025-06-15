---
title: "SLURM + MPI Cluster Setup on Ubuntu 20.04"
excerpt: "A comprehensive guide to setting up a high-performance computing cluster using SLURM and MPI on Ubuntu 20.04, covering networking, authentication, shared storage, and job scheduling."
date: "Jun 15, 2025"
---

# SLURM + MPI Cluster Setup on Ubuntu 20.04

To build a simple and reliable compute cluster, we will keep things clean and consistent. Static IPs (starting at .100) will make it easy to identify each machine without relying on dynamic assignments. We will use Chrony (literally will feel the importance after 5 hours of debug) to keep the system clocks in sync, which will be crucial for distributed tasks. We will enable passwordless SSH so the nodes can connect without repeatedly asking for credentials, making things smooth. Munge will handle authentication across nodes, and NFS will give us a shared space for files and executables. SLURM will take care of job scheduling, and MPI will let us run programs across multiple nodes. Altogether, this setup will ensure that everything talks to each other smoothly and works well whether you will be using CPUs, GPUs, or both.

---

## 1. Networking: Netplan Static IPs

On **all three nodes**, edit or create `/etc/netplan/01-network-manager-all.yaml`:

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    eno1:
      dhcp4: no
      addresses: [172.31.55.XXX/24]  # master→100, worker1→101, worker2→102
      gateway4: 172.31.55.1
      nameservers:
        addresses: [8.8.8.8, 1.1.1.1]
```

Replace `XXX` with the respective last octet for each machine (100 for master, 101 for worker1, 102 for worker2 since IPs from .1-.99 are often reserved for gateways, DNS and DHCP). Save the file, then apply the config:

```bash
sudo netplan apply
ip a
ping 172.31.55.1
```

This sets a unique static IP for each node so they can reliably communicate within the cluster.

---

## 2. Proxy Setup

Create system-wide environment variables:

```bash
sudo nano /etc/environment
```

Add:

```bash
http_proxy="http://PROXY_USERNAME:PROXY_PASSWD@172.31.100.14:3128/"
https_proxy="http://PROXY_USERNAME:PROXY_PASSWD@172.31.100.14:3128/"
ftp_proxy="http://PROXY_USERNAME:PROXY_PASSWD@172.31.100.14:3128/"
no_proxy="localhost,127.0.0.1,::1,172.31.55.0/24,172.31.100.0/24"
```

Set proxy for APT:

```bash
sudo nano /etc/apt/apt.conf.d/95proxies
```

Add:

```bash
Acquire::http::Proxy "http://PROXY_USERNAME:PROXY_PASSWD@172.31.100.14:3128/";
Acquire::https::Proxy "http://PROXY_USERNAME:PROXY_PASSWD@172.31.100.14:3128/";
Acquire::ftp::Proxy "http://PROXY_USERNAME:PROXY_PASSWD@172.31.100.14:3128/";
```

Apply:

```bash
source /etc/environment
```

---

## 3. Time Sync with Chrony

```bash
sudo apt update
sudo apt install -y chrony
sudo nano /etc/chrony/chrony.conf
```

Add at the top:

```bash
server time.cloudflare.com iburst
```

Restart and verify:

```bash
sudo systemctl restart chrony
chronyc sources
```

---

## 4. Hostname Resolution

Edit `/etc/hosts` on all nodes:

```
127.0.0.1   localhost
172.31.55.100   master
172.31.55.101   worker1
172.31.55.102   worker2
```

Test:

```bash
ping worker1
ping worker2
```

---

## 5. Passwordless SSH

```bash
sudo ssh-keygen -A
ssh-keygen -t rsa -b 4096 -N "" -f ~/.ssh/id_rsa
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Distribute keys:

```bash
ssh-copy-id hp@worker1
ssh-copy-id hp@worker2
ssh-copy-id hp@master
```

Test:

```bash
ssh master
ssh worker1
ssh worker2
```

---

## 6. NFS Shared Folder

### On master:

```bash
sudo apt install -y nfs-kernel-server
sudo mkdir -p /mnt/shared
sudo chown hp:hp /mnt/shared
sudo nano /etc/exports
```

Add:

```
/mnt/shared   172.31.55.0/24(rw,sync,no_subtree_check,no_root_squash)
```

Then:

```bash
sudo exportfs -ra
sudo exportfs -v
```

### On workers:

```bash
sudo apt install -y nfs-common
sudo mkdir -p /mnt/shared
sudo nano /etc/fstab
```

Add:

```
master:/mnt/shared   /mnt/shared   nfs   defaults,_netdev 0 0
```

Mount:

```bash
sudo mount -a
df -h | grep shared
```

---

## 7. Munge for SLURM Authentication

On all nodes:

```bash
sudo apt install -y munge libmunge-dev
```

### On master:

```bash
sudo create-munge-key
sudo chown munge:munge /etc/munge/munge.key
sudo chmod 400 /etc/munge/munge.key
sudo systemctl enable --now munge
```

Copy to workers:

```bash
scp /etc/munge/munge.key hp@worker1:/tmp/
scp /etc/munge/munge.key hp@worker2:/tmp/
```

### On workers:

```bash
sudo mv /tmp/munge.key /etc/munge/munge.key
sudo chown munge:munge /etc/munge/munge.key
sudo chmod 400 /etc/munge/munge.key
sudo systemctl enable --now munge
sudo systemctl restart munge
```

Verify from master:

```bash
munge -n | ssh worker1 unmunge
munge -n | ssh worker2 unmunge
```

---

## 8. MPI (OpenMPI + PMIx)

On all nodes:

```bash
sudo apt update
sudo apt install openmpi-bin libopenmpi-dev
```

Verify:

```bash
ldconfig -p | grep libmpi
```

If missing:

```bash
echo "/usr/lib/x86_64-linux-gnu/openmpi/lib" | sudo tee /etc/ld.so.conf.d/openmpi.conf
sudo ldconfig
```

Test:

```bash
mpirun -np 2 hostname
```

---

## 9. SLURM Installation & Setup

On all nodes:

```bash
sudo apt install -y slurm-wlm slurm-client
sudo useradd -m slurm
sudo mkdir -p /var/spool/slurm-llnl/ctld /var/spool/slurmd /var/log/slurm
sudo touch /var/log/slurm/slurmctld.log /var/log/slurm/slurmd.log
sudo chown -R slurm:slurm /var/spool/slurm-llnl /var/spool/slurmd /var/log/slurm*
```

---

## 10. Configure `slurm.conf` on Master

Edit `/etc/slurm-llnl/slurm.conf` on **master** node:

```conf
# Basic cluster settings
ClusterName=cluster
ControlMachine=master

# Authentication & tracking
AuthType=auth/munge
ProctrackType=proctrack/pgid
ReturnToService=2

# Ports (defaults below, only change if firewalls or custom ports required)
SlurmctldPort=6817
SlurmdPort=6818

# Directories and logging
SlurmUser=slurm
StateSaveLocation=/var/spool/slurm-llnl/ctld
SlurmdSpoolDir=/var/spool/slurmd
SlurmctldLogFile=/var/log/slurm/slurmctld.log
SlurmdLogFile=/var/log/slurm/slurmd.log
SlurmctldPidFile=/run/slurmctld.pid
SlurmdPidFile=/run/slurmd.pid

# Scheduler & plugin settings
SchedulerType=sched/backfill
SelectType=select/cons_res
SelectTypeParameters=CR_CPU_Memory

# Node definitions
NodeName=master NodeAddr=172.31.55.100 CPUs=8 Sockets=1 CoresPerSocket=4 ThreadsPerCore=2 RealMemory=3785 State=UNKNOWN
NodeName=worker1 NodeAddr=172.31.55.101 CPUs=8 Sockets=1 CoresPerSocket=4 ThreadsPerCore=2 RealMemory=3785 State=UNKNOWN
NodeName=worker2 NodeAddr=172.31.55.102 CPUs=8 Sockets=1 CoresPerSocket=4 ThreadsPerCore=2 RealMemory=3785 State=UNKNOWN

# Partition definition
PartitionName=debug Nodes=master,worker1,worker2 Default=YES MaxTime=INFINITE State=UP
```

Distribute to workers:

```bash
scp /etc/slurm-llnl/slurm.conf hp@worker1:/tmp/
scp /etc/slurm-llnl/slurm.conf hp@worker2:/tmp/
```

On workers:

```bash
sudo mv /tmp/slurm.conf /etc/slurm-llnl/slurm.conf
sudo chown slurm:slurm /etc/slurm-llnl/slurm.conf
```

---

## 11. Start SLURM Services

### Master:

```bash
sudo systemctl enable --now slurmctld
sudo systemctl enable --now slurmd
```

### Workers:

```bash
sudo systemctl enable --now slurmd
```

---

## 12. Cluster Health Check

```bash
sinfo
scontrol show nodes
srun -N3 -n3 hostname
```

---

## 13. Test MPI under SLURM

### hello\_mpi.c

```c
#include <mpi.h>
#include <stdio.h>
#include <unistd.h>
int main(int argc, char** argv) {
    MPI_Init(&argc, &argv);
    int world_rank, world_size;
    char hostname[256];
    MPI_Comm_rank(MPI_COMM_WORLD, &world_rank);
    MPI_Comm_size(MPI_COMM_WORLD, &world_size);
    gethostname(hostname, sizeof(hostname));
    printf("Hello from rank %d out of %d processors, executed on node: %s\n",
        world_rank, world_size, hostname);
    MPI_Finalize();
    return 0;
}
```

### Compile:

```bash
mpicc -o /mnt/shared/mpi_hello /mnt/shared/hello_mpi.c
```

### Run:

```bash
srun --mpi=pmix -N3 -n8 /mnt/shared/mpi_hello
```

You should see output from each rank across nodes.

---

> **Note**: Replace `hp` with your actual username throughout. Ensure you never mount over `/home/$USER` with NFS to avoid freezing your session.

---

## Appendix: GPU-Specific SLURM Cluster Setup

GPU cluster setup is same as CPU clustering but includes additional GPU-specific steps:

### 1. Install NVIDIA Drivers and CUDA

Ensure every GPU node has:

* Compatible NVIDIA driver installed
* CUDA toolkit
* `nvidia-smi` and `nvcc` work properly

### 2. Configure GPU Access in SLURM

In `slurm.conf`, add GPU info:

```conf
NodeName=gpu-node1 Gres=gpu:1
GresTypes=gpu
```

On each GPU node, create `/etc/slurm-llnl/gres.conf`:

```conf
Name=gpu Type=default File=/dev/nvidia0
```

### 3. Submit GPU Jobs with SRUN or SLURM:

Use SRUN:

```bash
srun --gres=gpu:1 --mpi=pmix -N3 -n8 ./gpu_program

```

Use a SLURM job script:

```bash
#!/bin/bash
#SBATCH --gres=gpu:1
#SBATCH --nodes=3
#SBATCH --ntasks=8

nvidia-smi
./your_gpu_program
```
With this finally you will setup the cluster for running some actual models on runways.

