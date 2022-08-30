load('ext://helm_resource', 'helm_resource', 'helm_repo')
load('ext://helm_remote', 'helm_remote')

# --- Variables ---
namespace='chainlink'
db_host='postgresql.' + namespace
link_version='1.7.0-nonroot'
db_user='chainlink'
db_pwd='sixteencharslong'
db='chainlink'

# --- Temp dir ---
base_path=os.path.abspath('cache')
local('mkdir -p ' + base_path,
    echo_off=True,
    quiet=True)

print("📢 K8s context: ", k8s_context())

# --- K8s namespace ---
print("📢 Setting namespace: ", namespace)

raw_yaml = read_file('./local-env/namespace.yaml')
yaml = str(raw_yaml).format(namespace=namespace)
k8s_yaml(blob(yaml))

# --- Chainlink node API & password files ---
print("📢 Chainlink password files")

api = """user@example.com
sixteencharslong
"""
api_path = base_path + '/.api'
local('echo "$CONTENTS" > ' + api_path,
      env={'CONTENTS': str(api)},
      echo_off=True,
      quiet=True)

pwd = 'secure_wallet_password'
pwd_path = base_path + '/.password'
local('echo "$CONTENTS" > ' + pwd_path,
      env={'CONTENTS': str(pwd)},
      echo_off=True,
      quiet=True)

# --- Postgres ---
print("📢 Starting PostgreSQL")

helm_remote(
    chart='postgresql',
    repo_name='bitnami',
    repo_url='https://charts.bitnami.com/bitnami',
    namespace=namespace,
    set=[
        'auth.username={}'.format(db_user),
        'auth.password={}'.format(db_pwd),
        'auth.postgresPassword={}'.format(db_pwd),
        'auth.database={}'.format(db)
    ]
)
k8s_resource('postgresql', port_forwards=[
  port_forward(5432, 5432, name='PSQL DB port'),
])

# --- Chainlink node ---
print("📢 Starting Chainlink node")

raw_yaml = read_file('./local-env/chainlink.yaml')
yaml = str(raw_yaml).format(
    namespace=namespace,
    chainlink_version=link_version,
    infura_token=os.environ['INFURA_TOKEN'],
    db_host=db_host,
    db_user=db_user,
    db_pwd=db_pwd,
    db=db,
    mount_path=base_path
)

k8s_yaml(blob(yaml))
k8s_resource(
    workload='chainlink',
    resource_deps=['postgresql'],
    port_forwards=[
        port_forward(6688, 6688, name='Chainlink port'),
    ]
)