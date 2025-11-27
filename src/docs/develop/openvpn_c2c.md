---
title: 使用openvpn实现手机访问内网电脑服务
index: false
icon: laptop-code
category:
  - 服务器
tag:
  - openvpn
---

我个人使用思源笔记已经5、6年了，作为一个本地使用的笔记软件，这款笔记在我心中堪称完美，奈何技术有限，一直也没有为它做出什么贡献。

多年的使用，我的笔记已经积累到一定程度，每每在外，想记笔记的时候，总是想着能直接访问家里电脑的笔记多好，奈何第三方同步有问题，思源官方的同步也不算是太好用，万幸的是，思源提供了发布功能，可以在局域网内的`6806`端口访问到。

最近学习了openvpn，于是想利用它实现手机访问内网电脑服务，经过一番折腾，千辛万苦，也终于是实现了哈哈😀。

总体的步骤分为三步
1. 配置openvpn服务器
2. 配置PC端
3. 配置手机端
## 运行环境
Ubuntu 22.04

## 配置openvpn服务器
想要达到这一步，首先就需要一台公网服务器，我使用的是阿里云的云服务器实例，99一年部署些小服务还是不错的。

### 1.下载openvpn的安装包
```
sudo apt install openvpn
```
最好保持openvpn的版本在2.5以上，要不然会出现一些兼容性的问题，而我的教程是以`2.6.14`版本为例。
### 2.下载EasyRSA
我的EasyRSA的版本是`3.1.7`，这个东西我没有使用apt下载，而是一个压缩包，需要的可以从这里下载[EasyRSA 3.1.7](https://pan.quark.cn/s/d7348f442cc4)

EasyRSA是个用来管理和生产证书的工具，它可以帮助我们生成CA证书，服务器证书，客户端证书，以及证书的签名等，可以保证在vpn隧道传输时的安全性。

下载后随便找个地方解压就行，我放在了`/etc`下
```
1. cd /etc
2. tar -xzvf EasyRSA-3.1.7.tgz  #解压压缩包
3. mv EasyRSA-3.1.7 ./openvpn-ca  #重命名
```
#### 2.1 初始化pki
```
cd /etc/openvpn-ca
./easyrsa init-pki #初始化pki目录
```
![初始化pki](/img/cd_openvpn.png)


#### 2.2 创建CA证书
```
./easyrsa build-ca

这里会提示Enter New CA Key Passphrase:

输入一个密码，以后在签发证书的时候，都需要输入这个密码才能签发，如果你不想要怎么麻烦
你可以使用 ./easyrsa build-ca nopass

接下来提示:Common Name (eg: your user, host, or server name) [Easy-RSA CA]:
这就是证书的名字，你可以输入一个名字，也可以直接回车，使用默认的Easy-RSA CA
这里我取名:TEST-CA

然后会在这个目录生成两个文件，ca.key不能泄露!
pki/ca.crt
pki/private/ca.key
```
#### 2.3 创建服务器证书
```
./easyrsa build-server-full server nopass

执行此命令生成一个没有密码的服务器证书，如果你想要设置密码，可以去掉nopass参数
这会生成两个文件

pki/private/server.key
pki/reqs/server.req
```

#### 2.4 创建Diffie-Hellman参数
```
./easyrsa gen-dh

这会生成一个文件
pki/dh.pem
```
#### 2.5 创建TLS认证文件
```
cd /etc/openvpn

openvpn --genkey --secret ta.key

这个命令的执行时间会长一些，耐心等待即可
现在我们在/etc/openvpn下生成了一个文件ta.key
```
#### 2.6 迁移必要的证书文件和校验文件
服务端需要用到的文件有
1. ca.crt
2. server.crt
3. server.key
4. dh.pem
5. ta.key

我们现在openvpn的目录下新建一个目录:`keys`，用来存在这些认证文件
```
cd /etc/openvpn/
mkdir keys
cd ./keys


# 复制文件
cp /etc/openvpn-ca/pki/ca.crt ./keys
cp /etc/openvpn-ca/pki/issued/server.crt ./keys
cp /etc/openvpn-ca/pki/private/server.key ./keys
cp /etc/openvpn-ca/pki/dh.pem ./keys
cp /etc/openvpn/ta.key ./keys
```
#### 2.7 配置server.conf
你可以在 `/usr/share/doc/openvpn/examples/sample-config-files`下找到示例配置文件
```
cp /usr/share/doc/openvpn/examples/sample-config-files/server.conf /etc/openvpn/server  #复制一份到openvpn的server目录下

```
#### 2.8 配置server.conf
你可以在 `/usr/share/doc/openvpn/examples/sample-config-files`下找到示例配置文件
```
cp /usr/share/doc/openvpn/examples/sample-config-files/server.conf /etc/openvpn/server  #复制一份到openvpn的server目录下

cp /usr/share/doc/openvpn/examples/sample-config-files/client.conf /etc/openvpn/client  #这里顺便也复制一份客户端的配置文件

然后编辑server.conf

vim /etc/openvpn/server/server.conf
```
主要的配置项有其下，直接给出示例，最重要是开启`client-to-client`
然后修改一下ca、cert、key、dh、ta.key的路径，改成我们刚刚创建的文件路径
```
port 1194  #服务监听端口，随便改

proto udp

dev tun

ca /etc/openvpn/keys/ca.crt
cert /etc/openvpn/keys/server.crt
key /etc/openvpn/keys/server.key  # This file should be kept secret
dh /etc/openvpn/keys/dh.pem

#2.5+的版本使用这个配置，2.4及以下使用AES-256-CBC
data-ciphers AES-256-GCM:AES-128-GCM:?CHACHA20-POLY1305:AES-256-CBC 

topology subnet

server 10.8.0.0 255.255.255.0  #vpn分配的地址池

ifconfig-pool-persist /var/log/openvpn/ipp.txt

client-to-client #这个非常重要，开启这个选项，客户端之间才能互相访问

keepalive 10 120

tls-auth /etc/openvpn/keys/ta.key 0 # This file is secret

persist-key
persist-tun

status /var/log/openvpn/openvpn-status.log
verb 3
explicit-exit-notify 1

```
#### 2.9 创建客户端证书
```
./easyrsa build-client-full client1 nopass #创建名字client1的客户端证书

这生成了两个文件:
pki/issued/client1.crt
pki/private/client1.key
```
#### 2.10 配置client.conf
```
client
dev tun
proto udp

#remote 192.168.1.1 1194
remote 公网IP地址 端口

resolv-retry infinite

nobind

persist-key
persist-tun

ca ca.crt
cert client1.crt #注意这里和你刚刚创建的客户端证书/密钥的名字保持一致
key client1.key 

remote-cert-tls server

data-ciphers AES-256-GCM:AES-128-GCM:?CHACHA20-POLY1305:AES-256-CBC

tls-auth ta.key 1

verb 3
```
#### 2.11 启动openvpn
```
sudo systemctl start openvpn-server@server
sudo systemctl enable openvpn-server@server #加入开机开机自启
```

#### 2.12 配置客户端
客户端需要的文件是
1. ca.crt
2. client1.crt
3. client1.key
4. ta.key
5. client.conf

这些文件通过SSH连接工具直接下载就行

在我们的PC上，需要把`client.conf`改名为`client.ovpn`

然后我们把这五个文件放在你安装openvpnGUI的config目录下

![客户端配置](/img/openvpn-client-config.png)

同理，手机端也是一样，我们再为手机那边创建一个客户端证书/key，在打包发到手机上，找个目录存着

## 配置Windows端
假设现在你已经启动好服务了，并且手机和PC都链接了openvpn server

PC IP:`10.8.0.2`
手机IP:`10.8.0.3`

openvpn会在电脑上创建一个虚拟网卡，一般叫`TAP-Windows Adapter V9`之类的。

按下徽标键，搜索powershell，以管理员身份运行

输入命令:`Get-NetAdapter`查看网卡

![查看网卡](/img/pwsl_getnet.png)

输入`Set-NetConnectionProfile -InterfaceAlias "网络适配器名称" -NetworkCategory Private`设置vpn虚拟网卡为专用网络。

这个网卡默认是公用网络，公用网络会收到防火墙的严格限制。以我的网卡为例，使用以下命令设置
```
Set-NetConnectionProfile -InterfaceAlias OpenVPN TAP-Windows6 -NetworkCategory Private
```

## 美美访问
这时候在你手机上，使用10.8.0.2:6806就可以访问到电脑上思源笔记啦😃