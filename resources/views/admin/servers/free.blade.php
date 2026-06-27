@extends('layouts.admin')

@section('title')
    Free Servers
@endsection

@section('content-header')
    <h1>Free Servers<small>Servers players created for themselves under the free server plan.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.servers') }}">Servers</a></li>
        <li class="active">Free Servers</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="box box-warning">
            <div class="box-header with-border">
                <h3 class="box-title">Specs for All Free Servers</h3>
            </div>
            <form action="{{ route('admin.servers.free.specs') }}" method="POST">
                <div class="box-body">
                    <div class="row">
                        <div class="form-group col-md-3">
                            <label class="control-label">Memory (MB)</label>
                            <input type="number" class="form-control" name="memory" value="{{ old('memory', $specs['memory']) }}">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="control-label">Disk Space (MB)</label>
                            <input type="number" class="form-control" name="disk" value="{{ old('disk', $specs['disk']) }}">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="control-label">CPU Limit (%)</label>
                            <input type="number" class="form-control" name="cpu" value="{{ old('cpu', $specs['cpu']) }}">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="control-label">Swap (MB)</label>
                            <input type="number" class="form-control" name="swap" value="{{ old('swap', $specs['swap']) }}">
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col-md-3">
                            <label class="control-label">Block IO Weight</label>
                            <input type="number" class="form-control" name="io" value="{{ old('io', $specs['io']) }}">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="control-label">Allocation Limit</label>
                            <input type="number" class="form-control" name="allocation_limit" value="{{ old('allocation_limit', $specs['allocation_limit']) }}">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="control-label">Database Limit</label>
                            <input type="number" class="form-control" name="database_limit" value="{{ old('database_limit', $specs['database_limit']) }}">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="control-label">Backup Limit</label>
                            <input type="number" class="form-control" name="backup_limit" value="{{ old('backup_limit', $specs['backup_limit']) }}">
                        </div>
                    </div>
                    <p class="text-muted small no-margin">Saving will immediately apply these specs to every existing free server below, and will be used as the specs for any new free server created from now on.</p>
                </div>
                <div class="box-footer">
                    {!! csrf_field() !!}
                    <button type="submit" class="btn btn-sm btn-warning pull-right">Update Specs for All Free Servers</button>
                </div>
            </form>
        </div>
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Free Server List</h3>
                <div class="box-tools search01">
                    <form action="{{ route('admin.servers.free') }}" method="GET">
                        <div class="input-group input-group-sm">
                            <input type="text" name="filter[*]" class="form-control pull-right" value="{{ request()->input()['filter']['*'] ?? '' }}" placeholder="Search Free Servers">
                            <div class="input-group-btn">
                                <button type="submit" class="btn btn-default"><i class="fa fa-search"></i></button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <tbody>
                        <tr>
                            <th>Server Name</th>
                            <th>UUID</th>
                            <th>Owner</th>
                            <th>Node</th>
                            <th>Connection</th>
                            <th>Specs</th>
                            <th></th>
                            <th></th>
                            <th></th>
                        </tr>
                        @foreach ($servers as $server)
                            <tr data-server="{{ $server->uuidShort }}">
                                <td><a href="{{ route('admin.servers.view', $server->id) }}">{{ $server->name }}</a></td>
                                <td><code title="{{ $server->uuid }}">{{ $server->uuid }}</code></td>
                                <td><a href="{{ route('admin.users.view', $server->user->id) }}">{{ $server->user->username }}</a></td>
                                <td><a href="{{ route('admin.nodes.view', $server->node->id) }}">{{ $server->node->name }}</a></td>
                                <td>
                                    <code>{{ $server->allocation->alias }}:{{ $server->allocation->port }}</code>
                                </td>
                                <td>
                                    <button type="button" class="btn btn-xs btn-default" data-toggle="modal" data-target="#specsModal{{ $server->id }}">
                                        {{ $server->memory }} MB / {{ $server->disk }} MB / {{ $server->cpu }}%
                                    </button>
                                </td>
                                <td class="text-center">
                                    @if($server->isSuspended())
                                        <span class="label bg-maroon">Suspended</span>
                                    @elseif(! $server->isInstalled())
                                        <span class="label label-warning">Installing</span>
                                    @else
                                        <span class="label label-success">Active</span>
                                    @endif
                                </td>
                                <td class="text-center">
                                    <form action="{{ route('admin.servers.free.suspend', $server->id) }}" method="POST">
                                        {!! csrf_field() !!}
                                        @if($server->isSuspended())
                                            <button type="submit" class="btn btn-xs btn-success" @if(! is_null($server->transfer)) disabled @endif>Unsuspend</button>
                                        @else
                                            <button type="submit" class="btn btn-xs btn-warning" @if(! is_null($server->transfer)) disabled @endif>Suspend</button>
                                        @endif
                                    </form>
                                </td>
                                <td class="text-center">
                                    <a class="btn btn-xs btn-default" href="/server/{{ $server->uuidShort }}"><i class="fa fa-wrench"></i></a>
                                </td>
                            </tr>
                        @endforeach
                        @if ($servers->isEmpty())
                            <tr>
                                <td colspan="9" class="text-center">No free servers have been created yet.</td>
                            </tr>
                        @endif
                    </tbody>
                </table>
            </div>
            @if($servers->hasPages())
                <div class="box-footer with-border">
                    <div class="col-md-12 text-center">{!! $servers->appends(['filter' => Request::input('filter')])->render() !!}</div>
                </div>
            @endif
        </div>
    </div>
</div>

@foreach ($servers as $server)
    <div class="modal fade" id="specsModal{{ $server->id }}" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <form action="{{ route('admin.servers.free.build', $server->id) }}" method="POST">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">Edit Specs &mdash; {{ $server->name }}</h4>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="form-group col-xs-6">
                                <label class="control-label">Memory (MB)</label>
                                <input type="number" name="memory" class="form-control" value="{{ $server->memory }}">
                            </div>
                            <div class="form-group col-xs-6">
                                <label class="control-label">Disk Space (MB)</label>
                                <input type="number" name="disk" class="form-control" value="{{ $server->disk }}">
                            </div>
                            <div class="form-group col-xs-6">
                                <label class="control-label">CPU Limit (%)</label>
                                <input type="number" name="cpu" class="form-control" value="{{ $server->cpu }}">
                            </div>
                            <div class="form-group col-xs-6">
                                <label class="control-label">Swap (MB)</label>
                                <input type="number" name="swap" class="form-control" value="{{ $server->swap }}">
                            </div>
                            <div class="form-group col-xs-6">
                                <label class="control-label">Block IO Weight</label>
                                <input type="number" name="io" class="form-control" value="{{ $server->io }}">
                            </div>
                            <div class="form-group col-xs-6">
                                <label class="control-label">Allocation Limit</label>
                                <input type="number" name="allocation_limit" class="form-control" value="{{ $server->allocation_limit }}">
                            </div>
                            <div class="form-group col-xs-6">
                                <label class="control-label">Database Limit</label>
                                <input type="number" name="database_limit" class="form-control" value="{{ $server->database_limit }}">
                            </div>
                            <div class="form-group col-xs-6">
                                <label class="control-label">Backup Limit</label>
                                <input type="number" name="backup_limit" class="form-control" value="{{ $server->backup_limit }}">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        {!! csrf_field() !!}
                        <button type="button" class="btn btn-default btn-sm pull-left" data-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary btn-sm">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endforeach
@endsection
