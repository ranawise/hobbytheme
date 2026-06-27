@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'free-servers'])

@section('title')
    Free Servers Settings
@endsection

@section('content-header')
    <h1>Free Servers<small>Configure the low-spec server players can create for themselves.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Settings</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')
    <div class="row">
        <div class="col-xs-12">
            <form action="{{ route('admin.settings.free-servers') }}" method="POST">
                {{ csrf_field() }}
                <div class="box">
                    <div class="box-header with-border">
                        <h3 class="box-title">Self-Service Free Server</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Status</label>
                                <div>
                                    <select class="form-control" name="free_servers:enabled">
                                        <option value="true" @if(old('free_servers:enabled', $current['enabled']) == 'true') selected @endif>Enabled</option>
                                        <option value="false" @if(old('free_servers:enabled', $current['enabled']) == 'false') selected @endif>Disabled</option>
                                    </select>
                                    <p class="text-muted small">If enabled, users will be able to create one free server for themselves from their dashboard.</p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Egg</label>
                                <div>
                                    <select class="form-control" name="free_servers:egg_id">
                                        @foreach ($nests as $nest)
                                            <optgroup label="{{ $nest->name }}">
                                                @foreach ($nest->eggs as $egg)
                                                    <option value="{{ $egg->id }}" @if((int) old('free_servers:egg_id', $current['egg_id']) === $egg->id) selected @endif>{{ $egg->name }}</option>
                                                @endforeach
                                            </optgroup>
                                        @endforeach
                                    </select>
                                    <p class="text-muted small">The egg that free servers will be created with.</p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Allowed Nodes</label>
                                <div>
                                    @foreach ($nodes as $node)
                                        <label class="checkbox-inline" style="display:block;">
                                            <input type="checkbox" name="free_servers:node_ids[]" value="{{ $node->id }}"
                                                @if(in_array($node->id, old('free_servers:node_ids', $current['node_ids']))) checked @endif>
                                            {{ $node->name }}
                                        </label>
                                    @endforeach
                                    <p class="text-muted small">Free servers will only be deployed to the selected node(s).</p>
                                </div>
                            </div>
                        </div>
                        <p class="text-muted small no-margin">
                            Resource specs (memory, disk, CPU, etc.) for free servers are managed from the
                            <a href="{{ route('admin.servers.free') }}">Free Servers</a> page, not here.
                        </p>
                    </div>
                </div>
                <div class="box box-primary">
                    <div class="box-footer">
                        <button type="submit" name="_method" value="PATCH" class="btn btn-sm btn-primary pull-right">Save</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
@endsection
